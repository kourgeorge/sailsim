// Text only: canonical scenario geometry and grading remain in the course.
export default {
  'decision-sail-46': {
    title: 'Rencontres à voile : amure, au vent et rattrapage',
    brief: 'Examinez le schéma et le compte rendu avant de répondre.',
    limitations:
      'Étudiez les règles internationales du RIPAM citées et les règles locales. Exercez-vous avec un moniteur : les schémas évaluent le raisonnement, pas la capacité réelle à éviter un abordage.',
    stages: {
      opposite: {
        title: 'Amures différentes',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Amures différentes',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Règles internationales, en vue, eau libre, risque, sans statut particulier ni rattrapage. Vous êtes A bâbord amures ; B est tribord amures.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'A s’écarte ; les deux surveillent',
              'choice-1': 'B s’écarte car il est à droite du schéma',
              'choice-2': 'Aucun n’a d’obligation',
            },
          },
        },
      },
      same: {
        title: 'Changez de point de vue',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Changez de point de vue',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Vous êtes maintenant B, sous le vent. A est au vent ; tous deux tribord amures, avec risque sans rattrapage. A agit tôt et convenablement.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Changer de cap de façon imprévisible',
              'choice-1': 'Maintenir initialement cap et vitesse en surveillant',
              'choice-2': 'Cesser la veille',
            },
          },
        },
      },
      overtake: {
        title: 'Le rattrapage prime',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Le rattrapage prime',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Vous êtes A, voilier arrivant à 30° sur l’arrière du travers du moteur B, en vue. Vous êtes au travers, mais pas encore paré et clair.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'B doit maintenant céder à la voile',
              'choice-1': 'L’obligation a cessé au travers',
              'choice-2': 'A reste à l’écart jusqu’à être paré et clair',
            },
          },
        },
      },
    },
  },
  'decision-sail-47': {
    title: 'Au moteur : routes opposées, croisement et rencontres mixtes',
    brief: 'Examinez le schéma et le compte rendu avant de répondre.',
    limitations:
      'Étudiez les règles internationales du RIPAM citées et les règles locales. Exercez-vous avec un moniteur : les schémas évaluent le raisonnement, pas la capacité réelle à éviter un abordage.',
    stages: {
      crossing: {
        title: 'Croisement au moteur',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Croisement au moteur',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Vous êtes A vers le nord, au moteur avec voiles hissées. B, bateau à moteur ordinaire, arrive sur tribord. En vue, risque de croisement en eau libre, sans rattrapage.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'A s’écarte et évite de passer devant si possible',
              'choice-1': 'A a priorité comme voilier',
              'choice-2': 'B s’écarte car A est plus grand',
            },
          },
        },
      },
      reverse: {
        title: 'Le même croisement depuis B',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Le même croisement depuis B',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Vous êtes B dans le même croisement. A est sur bâbord et agit tôt et correctement. Aucun statut ni restriction particulière.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Toujours venir sur bâbord',
              'choice-1': 'Maintenir d’abord cap et vitesse et surveiller A',
              'choice-2': 'Ignorer A puisqu’il s’écarte',
            },
          },
        },
      },
      'head-on': {
        title: 'Routes opposées sur le bord suivant',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Routes opposées sur le bord suivant',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Deux navires à moteur ordinaires se rencontrent sur des routes presque opposées avec risque, en vue et en eau libre, sans rattrapage ni statut particulier.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Seul A tourne',
              'choice-1': 'Les deux sur bâbord',
              'choice-2': 'Les deux sur tribord pour passer bâbord sur bâbord',
            },
          },
        },
      },
    },
  },
  'decision-sail-48': {
    title: 'S’écarter ou maintenir : agir quand le risque évolue',
    brief: 'Examinez le schéma et le compte rendu avant de répondre.',
    limitations:
      'Étudiez les règles internationales du RIPAM citées et les règles locales. Exercez-vous avec un moniteur : les schémas évaluent le raisonnement, pas la capacité réelle à éviter un abordage.',
    stages: {
      early: {
        title: 'Rendez l’action claire',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Rendez l’action claire',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Vous devez vous écarter dans un croisement en vue. L’espace permet une manœuvre précoce ; trafic et dangers sont vérifiés.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Faire un changement franc et visible et vérifier son effet',
              'choice-1': 'Faire de nombreux petits virages peu visibles',
              'choice-2': 'Attendre d’être très proche',
            },
          },
        },
      },
      may: {
        title: 'L’autre n’agit pas',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'L’autre n’agit pas',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Vous êtes B, privilégié dans un croisement de moteurs. A, sur bâbord, n’agit manifestement pas convenablement. Il reste de la place avant que A ne puisse plus éviter seul l’abordage.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Vous devez attendre l’urgence',
              'choice-1': 'Vous pouvez agir ; évitez de venir sur bâbord pour A si possible',
              'choice-2': 'Un appel transfère toute responsabilité à A',
            },
          },
        },
      },
      must: {
        title: 'Agir devient obligatoire',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Agir devient obligatoire',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'L’observation suivante montre les navires si proches que A seul ne peut éviter l’abordage. Vous êtes B ; la manœuvre exacte dépend de l’espace et des dangers.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Maintenir cap et vitesse quoi qu’il arrive',
              'choice-1': 'Signaler sans agir pour éviter',
              'choice-2': 'Prendre la meilleure mesure pour éviter l’abordage',
            },
          },
        },
      },
    },
  },
  'decision-sail-49': {
    title: 'Navires particuliers, chenaux étroits et voies de circulation',
    brief: 'Examinez le schéma et le compte rendu avant de répondre.',
    limitations:
      'Étudiez les règles internationales du RIPAM citées et les règles locales. Exercez-vous avec un moniteur : les schémas évaluent le raisonnement, pas la capacité réelle à éviter un abordage.',
    stages: {
      status: {
        title: 'Vérifiez le statut réel',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Vérifiez le statut réel',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'B est un bateau à moteur de plaisance traînant une ligne sans restriction de manœuvre ni autre statut particulier. Classez-le avant les règles de rencontre.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Navire à moteur ordinaire',
              'choice-1': 'Toujours un pêcheur prioritaire',
              'choice-2': 'Non maître de sa manœuvre',
            },
          },
        },
      },
      channel: {
        title: 'Laissez le passage libre dans le chenal',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Laissez le passage libre dans le chenal',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Votre voilier A de 12 m veut traverser un chenal. B ne peut naviguer en sécurité qu’à l’intérieur. Traverser maintenant le gênerait ; vous pouvez attendre dehors sans danger.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Passer devant parce que A a des voiles',
              'choice-1': 'Attendre à l’écart et traverser sans gêner B',
              'choice-2': 'Mouiller au milieu du chenal',
            },
          },
        },
      },
      lane: {
        title: 'Préparez la traversée de la voie',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Préparez la traversée de la voie',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'A doit traverser une voie OMI vers le nord. Le courant le porte à l’est. Un intervalle sûr permet de ne gêner aucun moteur suivant la voie. Choisissez le principe de cap.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Suivre la voie indéfiniment',
              'choice-1': 'N’importe quel cap si la route fond est perpendiculaire',
              'choice-2': 'Traverser avec un cap presque perpendiculaire au trafic',
            },
          },
        },
      },
    },
  },
  'decision-sail-50': {
    title: 'Lire les feux, marques et signaux sonores',
    brief: 'Examinez le schéma et le compte rendu avant de répondre.',
    limitations:
      'Étudiez les règles internationales du RIPAM citées et les règles locales. Exercez-vous avec un moniteur : les schémas évaluent le raisonnement, pas la capacité réelle à éviter un abordage.',
    stages: {
      lights: {
        title: 'Lisez le signal vertical',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Lisez le signal vertical',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'De nuit en vue, B montre trois feux visibles sur tout l’horizon : rouge, blanc, rouge. Ce sont ses feux de statut ; d’autres dépendent de son activité et de son mouvement.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Capacité de manœuvre restreinte',
              'choice-1': 'Voilier bâbord amures',
              'choice-2': 'Aucun statut particulier',
            },
          },
        },
      },
      shape: {
        title: 'Identifiez le cône de jour',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Identifiez le cône de jour',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'B navigue avec des voiles et un cône noir pointe en bas, sans autre statut signalé. Quelle propulsion cela indique-t-il?',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Propulsion à voile seule',
              'choice-1': 'Aussi propulsé au moteur',
              'choice-2': 'Au mouillage',
            },
          },
        },
      },
      doubt: {
        title: 'Signalez le doute rapidement',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Signalez le doute rapidement',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Les navires approchent en vue. Vous ne comprenez pas B et doutez de l’action suffisante. Choisissez le signal international et la suite.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Un prolongé et cesser d’observer',
              'choice-1': 'Trois brefs pour exiger la priorité',
              'choice-2': 'Au moins cinq brefs rapides ; poursuivre évaluation et action',
            },
          },
        },
      },
    },
  },
  'decision-sail-51': {
    title: 'Visibilité réduite et plan complet de rencontre',
    brief: 'Examinez le schéma et le compte rendu avant de répondre.',
    limitations:
      'Étudiez les règles internationales du RIPAM citées et les règles locales. Exercez-vous avec un moniteur : les schémas évaluent le raisonnement, pas la capacité réelle à éviter un abordage.',
    stages: {
      radar: {
        title: 'Évaluez le contact invisible',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Évaluez le contact invisible',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Dans la brume, B est détecté au radar seul sur l’avant du travers, avec risque sans rattrapage. Quelle venue éviter autant que possible selon 19(d)?',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Éviter une venue sur bâbord pour B ; évaluer les options sûres',
              'choice-1': 'Toujours venir sur bâbord',
              'choice-2': 'Revendiquer un statut privilégié car B est invisible',
            },
          },
        },
      },
      sound: {
        title: 'Un signal de brume devant',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Un signal de brume devant',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Un signal de brume paraît maintenant sur l’avant du travers. L’absence de risque n’est pas établie. Votre yacht est au moteur.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Garder la vitesse de croisière jusqu’à le voir',
              'choice-1':
                'Réduire au minimum pour tenir le cap, casser l’erre si nécessaire et redoubler de prudence',
              'choice-2': 'Siffler au lieu de changer de vitesse',
            },
          },
        },
      },
      reassess: {
        title: 'Réévaluez après avoir agi',
        brief: 'Examinez le schéma et le compte rendu avant de répondre.',
        goal: 'Réévaluez après avoir agi',
        success: 'Étape terminée. Réévaluez la situation suivante selon ses propres faits.',
        retry:
          'Revoyez la rencontre, la règle et les devoirs des deux navires, puis corrigez votre décision.',
        facts: {
          report: {
            label: 'Compte rendu',
            text: 'Vous avez ralenti et commencé à agir. Le radar montre le même relèvement et une distance moindre. Le contact reste invisible, aucun passage sûr n’est établi.',
          },
        },
        fields: {
          response: {
            label: 'Votre décision',
            options: {
              'choice-0': 'Déclarer le passage sûr puisque vous avez agi',
              'choice-1': 'Passer à la priorité ordinaire à voile',
              'choice-2':
                'Maintenir le risque, réévaluer l’action et surveiller jusqu’au passage sûr',
            },
          },
        },
      },
    },
  },
};
