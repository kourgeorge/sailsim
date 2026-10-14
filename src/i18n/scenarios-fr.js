import colregs from './colregs-fr.js';
// Original scenario translations; numeric fixtures and assessment rules remain canonical.
export default {
  ...colregs,
  "decision-sail-01": {
    "title": "Préparer Meridian au départ",
    "brief": "Vous préparez le yacht fictif Meridian avec deux nouveaux équipiers. Corrigez le défaut matériel, répartissez les rôles et validez le départ.",
    "limitations": "Évalue les décisions à partir de rapports, sans inspecter du matériel réel ni évaluer les gestes de l’équipage.",
    "stages": {
      "equipment": {
        "title": "Corriger le défaut matériel",
        "brief": "Consultez l’inventaire et le rapport d’équipage avant d’autoriser le départ.",
        "goal": "Prévoyez un gilet adapté à chaque personne avant de valider cette étape.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "inventory": {
            "label": "Inventaire du matériel",
            "text": "Trois personnes sont à bord. Deux gilets sont adaptés ; le troisième est trop grand. Le coffre de réserve contient la bonne taille."
          },
          "crew": {
            "label": "Rapport d’équipage",
            "text": "Le nouvel équipier n’a ni ajusté ni vérifié le gilet de remplacement. Un gilet mal serré n’est pas prêt à être porté."
          }
        },
        "fields": {
          "prepare": {
            "label": "Valider les préparatifs nécessaires",
            "options": {
              "replace": "Prendre le remplacement adapté",
              "fit": "Ajuster et vérifier chaque gilet",
              "ignore": "Partir avec le gilet trop grand",
              "stow": "Ranger tous les gilets sous le pont"
            }
          }
        }
      },
      "roles": {
        "title": "Répartir les rôles de départ",
        "brief": "Le défaut est corrigé. Attribuez un rôle principal à chacun et expliquez les risques.",
        "goal": "Attribuez trois rôles distincts et expliquez les deux risques représentés.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "people": {
            "label": "Équipage disponible",
            "text": "Alex sait barrer. Sam peut assurer la veille. Jo peut manier les bouts préparés sous direction."
          },
          "hazards": {
            "label": "Risques dans le cockpit",
            "text": "La bôme peut balayer le cockpit. Les bouts sous tension et les winchs peuvent coincer les doigts."
          }
        },
        "fields": {
          "alex": {
            "label": "Rôle d’Alex",
            "options": {
              "helm": "Barre",
              "lookout": "Veille",
              "lines": "Bouts préparés"
            }
          },
          "sam": {
            "label": "Rôle de Sam",
            "options": {
              "helm": "Barre",
              "lookout": "Veille",
              "lines": "Bouts préparés"
            }
          },
          "jo": {
            "label": "Rôle de Jo",
            "options": {
              "helm": "Barre",
              "lookout": "Veille",
              "lines": "Bouts préparés"
            }
          },
          "briefing": {
            "label": "Inclure dans le briefing",
            "options": {
              "boom": "Rester hors du débattement de la bôme",
              "hands": "Éloigner les mains des bouts sous tension",
              "jump": "Sauter à terre pour arrêter le bateau"
            }
          }
        }
      },
      "release": {
        "title": "Valider la liste de départ",
        "brief": "La route et l’équipage sont prêts. Consultez les derniers rapports avant de décider du départ.",
        "goal": "Validez seulement lorsque les préparatifs indiqués sont terminés et le critère de retour défini.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "forecast": {
            "label": "Prévisions et route",
            "text": "La route abritée proposée respecte les limites convenues pendant tout le trajet prévu et sa marge de réserve."
          },
          "status": {
            "label": "Rapport final",
            "text": "Les gilets sont ajustés, les rôles expliqués ; sécurité, communications et état du bateau ont été vérifiés."
          },
          "trigger": {
            "label": "Critère de retour",
            "text": "Faites demi-tour avant la zone exposée si la visibilité masque les repères côtiers prévus."
          }
        },
        "fields": {
          "decision": {
            "label": "Décision de départ",
            "options": {
              "depart": "Suivre le plan abrité vérifié",
              "unchecked": "Partir sur une route au large non vérifiée",
              "skip": "Ignorer les derniers rapports"
            }
          },
          "trigger": {
            "label": "Consigner le critère de retour",
            "options": {
              "visibility": "Perte des repères côtiers prévus",
              "promise": "Uniquement après l’arrivée",
              "none": "Aucun critère de retour"
            }
          }
        }
      }
    }
  },
  "decision-sail-02": {
    "title": "Donner des indications à bord",
    "brief": "Placez matériel et équipiers avec les repères du bateau, puis recommencez après un changement de vue.",
    "limitations": "Évalue le vocabulaire spatial sur un schéma, sans évaluer les déplacements sur un vrai yacht.",
    "stages": {
      "identify": {
        "title": "Légender le plan du yacht",
        "brief": "Le dessin est vu de dessus, l’étrave en haut.",
        "goal": "Attribuez les noms fixes du bateau aux quatre positions indiquées.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "orientation": {
            "label": "Orientation de la vue",
            "text": "Vous regardez le yacht de dessus, étrave en haut. Bâbord et tribord se définissent en regardant vers l’avant."
          }
        },
        "fields": {
          "top": {
            "label": "Repère supérieur",
            "options": {
              "bow": "Étrave",
              "stern": "Poupe",
              "port": "Bâbord",
              "starboard": "Tribord"
            }
          },
          "bottom": {
            "label": "Repère inférieur",
            "options": {
              "bow": "Étrave",
              "stern": "Poupe",
              "port": "Bâbord",
              "starboard": "Tribord"
            }
          },
          "left": {
            "label": "Repère gauche",
            "options": {
              "bow": "Étrave",
              "stern": "Poupe",
              "port": "Bâbord",
              "starboard": "Tribord"
            }
          },
          "right": {
            "label": "Repère droit",
            "options": {
              "bow": "Étrave",
              "stern": "Poupe",
              "port": "Bâbord",
              "starboard": "Tribord"
            }
          }
        }
      },
      "dispatch": {
        "title": "Envoyer l’équipage aux postes demandés",
        "brief": "Choisissez les postes de deux équipiers par rapport au bateau.",
        "goal": "Placez la veille à l’avant et l’aide du côté demandé.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "orders": {
            "label": "Consignes à l’équipage",
            "text": "Envoyez la veille au poste avant et l’aide à tribord du cockpit. L’étrave est toujours en haut."
          }
        },
        "fields": {
          "lookout": {
            "label": "Poste de veille",
            "options": {
              "bow": "Poste avant",
              "stern": "Poste arrière",
              "port": "Cockpit bâbord",
              "starboard": "Cockpit tribord"
            }
          },
          "helper": {
            "label": "Poste de l’aide",
            "options": {
              "bow": "Poste avant",
              "stern": "Poste arrière",
              "port": "Cockpit bâbord",
              "starboard": "Cockpit tribord"
            }
          }
        }
      },
      "reverse-view": {
        "title": "Recommencer depuis la vue opposée",
        "brief": "Le plan a fait demi-tour. Les noms relatifs au bateau restent identiques.",
        "goal": "Réattribuez correctement les repères de l’écran après le changement de vue.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "rotation": {
            "label": "Vue modifiée",
            "text": "L’étrave est maintenant en bas. La gauche et la droite de l’écran ont changé par rapport au bateau."
          }
        },
        "fields": {
          "left": {
            "label": "Le repère gauche désigne maintenant",
            "options": {
              "port": "Bâbord",
              "starboard": "Tribord",
              "bow": "Étrave"
            }
          },
          "right": {
            "label": "Le repère droit désigne maintenant",
            "options": {
              "port": "Bâbord",
              "starboard": "Tribord",
              "stern": "Poupe"
            }
          },
          "bottom": {
            "label": "Le repère inférieur désigne maintenant",
            "options": {
              "bow": "Étrave",
              "stern": "Poupe",
              "port": "Bâbord"
            }
          }
        }
      }
    }
  },
  "decision-sail-03": {
    "title": "Préparer les commandes des voiles",
    "brief": "Planifiez les commandes et le hissage, puis réagissez à un bout coincé avant d’augmenter la tension.",
    "limitations": "Il s’agit de décisions de commande et de procédure. Les manœuvres réelles, les charges et les procédures du matériel exigent une pratique encadrée.",
    "stages": {
      "map": {
        "title": "Associer les commandes aux tâches",
        "brief": "Utilisez la fiche du matériel pour compléter la consigne.",
        "goal": "Associez le hissage et le réglage d’angle aux bouts adaptés.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "equipment": {
            "label": "Fonctions des commandes",
            "text": "Les drisses hissent les voiles. Les écoutes règlent leur angle. Les ris réduisent leur surface."
          }
        },
        "fields": {
          "raise": {
            "label": "Hisser la grand-voile avec",
            "options": {
              "halyard": "Drisse de grand-voile",
              "sheet": "Écoute de grand-voile",
              "rode": "Ligne de mouillage"
            }
          },
          "angle": {
            "label": "Régler l’angle de la voile d’avant avec",
            "options": {
              "halyard": "Drisse de voile d’avant",
              "sheet": "Écoute de voile d’avant",
              "reef": "Commande de prise de ris"
            }
          }
        }
      },
      "prepare": {
        "title": "Préparer la procédure de hissage",
        "brief": "Le yacht est en eaux dégagées. Ordonnez les tâches avant de mettre la drisse en tension.",
        "goal": "Vérifiez équipage et bouts, déchargez la voile, puis commencez à hisser.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "procedure": {
            "label": "Procédure du bateau pour cet exercice",
            "text": "Vérifiez d’abord l’espace, l’équipage et les bouts ; choquez ensuite l’écoute et gardez la voile déchargée ; hissez seulement après."
          }
        },
        "fields": {
          "sequence": {
            "label": "Ordonner la séquence de travail",
            "options": {
              "check": "Vérifier l’espace, l’équipage et les bouts",
              "unload": "Choquer l’écoute et décharger la voile",
              "hoist": "Commencer à hisser"
            }
          }
        }
      },
      "foul": {
        "title": "Réagir à un coincement",
        "brief": "La voile cesse de monter et la tension du bout augmente soudainement.",
        "goal": "Cessez d’augmenter la tension et organisez une inspection sûre avant de poursuivre.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "snag": {
            "label": "Nouveau rapport matériel",
            "text": "Une drisse est coincée. L’équipage ne peut pas encore localiser le blocage en sécurité. Tirer davantage risque de blesser quelqu’un ou d’endommager le matériel."
          }
        },
        "fields": {
          "response": {
            "label": "Valider la réaction",
            "options": {
              "stop": "Arrêter le hissage et la mise en tension",
              "inspect": "Décharger et inspecter selon la procédure sûre du bateau",
              "force": "Forcer au winch pour franchir le blocage"
            }
          }
        }
      }
    }
  },
  "decision-sail-05": {
    "title": "Choisir un cap tenant compte du vent",
    "brief": "Placez le vent sur le compas et maintenez le cap prévu hors du secteur non navigable du modèle après une rotation du vent.",
    "limitations": "Le travail utilise le secteur exclu du simulateur. Les angles navigables d’un vrai yacht dépendent de sa conception et des conditions.",
    "stages": {
      "wind": {
        "title": "Placer les deux flèches de vent",
        "brief": "Utilisez les prévisions pour distinguer origine et destination.",
        "goal": "Saisissez les relèvements de provenance du vent et de déplacement de l’air.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "wind": {
            "label": "Bulletin de vent",
            "text": "Le vent vient du 315°. Les relèvements augmentent dans le sens horaire depuis le nord. L’air se déplace donc dans le sens opposé."
          }
        },
        "fields": {
          "windFrom": {
            "label": "Le vent vient du",
            "options": {}
          },
          "airToward": {
            "label": "L’air se déplace vers",
            "options": {}
          }
        }
      },
      "course": {
        "title": "Placer le cap hors du secteur exclu",
        "brief": "Le modèle exclut les caps à moins de 38° de la provenance du vent.",
        "goal": "Choisissez un cap au travers et identifiez le secteur exclu.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "zone": {
            "label": "Limite du modèle",
            "text": "Avec un vent du 315°, le secteur exclu va du 277° au 353° en passant par 315°. Le travers est à 90° de la provenance du vent."
          }
        },
        "fields": {
          "heading": {
            "label": "Fixer le cap au travers vers le nord-est",
            "options": {}
          },
          "excluded": {
            "label": "Indiquer le cap exclu",
            "options": {
              "45": "045°",
              "225": "225°",
              "315": "315°"
            }
          }
        }
      },
      "shift": {
        "title": "Réviser après la rotation du vent",
        "brief": "Le nouveau vent rend le cap de 330° envisagé auparavant non navigable.",
        "goal": "Remplacez-le par le cap au travers proposé.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "shift": {
            "label": "Vent actualisé",
            "text": "Le vent vient maintenant du 000°. Le cap 330° est à 30° de sa provenance ; le 090° à 90°."
          }
        },
        "fields": {
          "windFrom": {
            "label": "Actualiser la flèche de provenance du vent",
            "options": {}
          },
          "revisedHeading": {
            "label": "Valider le cap révisé",
            "options": {
              "0": "000°",
              "90": "090°",
              "330": "330°"
            }
          }
        }
      }
    }
  },
  "decision-sail-17": {
    "title": "Établir un relevé du vent apparent",
    "brief": "Complétez trois cas instrumentaux avec le vent relatif au yacht en mouvement.",
    "limitations": "Ces exercices vectoriels colinéaires exacts suivent les hypothèses indiquées ; ce ne sont pas des performances mesurées.",
    "stages": {
      "stationary": {
        "title": "Consigner le cas immobile",
        "brief": "Le yacht est immobile par rapport au fond dans un vent du nord de 10 nœuds.",
        "goal": "Notez le vent apparent avant le déplacement.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "case": {
            "label": "Observation A",
            "text": "Le vent réel vient du 000° à 10 kn. Vitesse du bateau et courant sont nuls."
          }
        },
        "fields": {
          "apparentSpeed": {
            "label": "Vitesse du vent apparent",
            "options": {}
          },
          "source": {
            "label": "Le vent apparent vient du",
            "options": {
              "north": "Nord",
              "south": "Sud",
              "none": "Sans direction"
            }
          }
        }
      },
      "upwind": {
        "title": "Consigner le cas face au vent",
        "brief": "Pour cet exercice vectoriel, le yacht avance au moteur vers le nord à 4 nœuds.",
        "goal": "Soustrayez la vitesse du bateau à celle de l’air.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "case": {
            "label": "Observation B",
            "text": "Le vent reste du 000° à 10 kn. Le bateau va à 4 kn vers 000°. Sans courant : c’est un exemple vectoriel, pas de la voile face au vent."
          }
        },
        "fields": {
          "apparentSpeed": {
            "label": "Vitesse du vent apparent",
            "options": {}
          },
          "relative": {
            "label": "Vent relatif à l’étrave",
            "options": {
              "ahead": "De l’avant",
              "astern": "De l’arrière",
              "beam": "Du travers"
            }
          }
        }
      },
      "downwind": {
        "title": "Consigner le cas sous le vent",
        "brief": "Le yacht se déplace maintenant vers le sud à 4 nœuds dans le même vent.",
        "goal": "Actualisez le relevé et identifiez le vent utilisé pour régler les voiles.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "case": {
            "label": "Observation C",
            "text": "L’air va toujours à 10 kn vers le sud. Le bateau va maintenant à 4 kn vers le sud. Le courant reste nul."
          }
        },
        "fields": {
          "apparentSpeed": {
            "label": "Vitesse du vent apparent",
            "options": {}
          },
          "trimReference": {
            "label": "Utiliser pour le réglage des voiles du modèle",
            "options": {
              "apparent": "Vent relatif au yacht en mouvement",
              "true": "Seulement le vent réel référencé au sol",
              "none": "Ignorer la direction du vent"
            }
          }
        }
      }
    }
  },
  "decision-sail-20": {
    "title": "Choisir une fenêtre de départ",
    "brief": "Comparez les prévisions horaires aux limites de l’équipage et réagissez à un bulletin révisé.",
    "limitations": "Les limites de vent et de visibilité sont propres à l’exercice, pas universelles. Aucune prévision en direct n’est utilisée.",
    "stages": {
      "limits": {
        "title": "Fixer les limites du plan",
        "brief": "Lisez l’accord de l’équipage avant d’évaluer les horaires de départ.",
        "goal": "Consignez les deux limites et la période complète de prévision nécessaire.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "crew": {
            "label": "Limites de l’exercice",
            "text": "Pour ce trajet fictif, l’équipage accepte des rafales jusqu’à 18 kn et une visibilité d’au moins 3 NM."
          },
          "duration": {
            "label": "Marge du trajet",
            "text": "Le trajet dure 2 heures et exige 1 heure supplémentaire de marge météorologique."
          }
        },
        "fields": {
          "gustLimit": {
            "label": "Rafale maximale",
            "options": {}
          },
          "visibilityLimit": {
            "label": "Visibilité minimale",
            "options": {}
          },
          "window": {
            "label": "Couverture des prévisions depuis le départ",
            "options": {}
          }
        }
      },
      "window": {
        "title": "Choisir la fenêtre utilisable",
        "brief": "Comparez les conditions sur tout le trajet et sa réserve.",
        "goal": "Choisissez le départ dont toute la fenêtre respecte les limites.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "early": {
            "label": "Bulletin du matin",
            "text": "De 08:00 à 11:00 : rafales de 14–17 kn, visibilité de 5 NM."
          },
          "late": {
            "label": "Bulletin suivant",
            "text": "De 11:00 à 15:00 : rafales de 22 kn, visibilité de 2 NM."
          }
        },
        "fields": {
          "departure": {
            "label": "Valider l’heure de départ",
            "options": {
              "1000": "10:00",
              "1200": "12:00",
              "0800": "08:00"
            }
          }
        }
      },
      "revision": {
        "title": "Appliquer le nouveau bulletin",
        "brief": "Avant le départ, une actualisation avance la dégradation.",
        "goal": "Modifiez le plan pendant que le yacht est encore amarré en sécurité.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "update": {
            "label": "Bulletin révisé",
            "text": "Des rafales de 22 kn et une visibilité de 2 NM sont désormais prévues dès 09:00. Le départ de 08:00 n’offre plus trois heures conformes."
          }
        },
        "fields": {
          "decision": {
            "label": "Statut de départ révisé",
            "options": {
              "wait": "Attendre et réévaluer une fenêtre acceptable",
              "go": "Partir avec les anciennes prévisions",
              "faster": "Partir en supposant qu’accélérer résout le problème météo"
            }
          },
          "notify": {
            "label": "Actualiser le plan consigné",
            "options": {
              "crew": "Informer l’équipage du report",
              "forecast": "Consigner le bulletin révisé",
              "delete": "Supprimer les limites du plan"
            }
          }
        }
      }
    }
  },
  "decision-sail-21": {
    "title": "Tracer une route autour de l’île",
    "brief": "Inspectez une carte fictive, construisez une route sûre et vérifiez les informations nécessaires à une carte réelle.",
    "limitations": "La géométrie est fictive et impropre à la navigation. Éviter l’île ne garantit ni profondeur ni sécurité réelles.",
    "stages": {
      "inspect": {
        "title": "Inspecter les informations de la carte",
        "brief": "La carte est un schéma pédagogique orienté nord en haut.",
        "goal": "Identifiez ce que la carte permet ou non d’établir.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "chart": {
            "label": "Informations de la carte",
            "text": "Cette carte fictive montre une île et des points de route. Les bouées ambrées sont des cibles d’exercice, pas un système IALA complet."
          },
          "limits": {
            "label": "Informations réelles manquantes",
            "text": "Aucun levé hydrographique actuel, zéro hydrographique ni hauteur de marée en direct n’est fourni."
          }
        },
        "fields": {
          "available": {
            "label": "Indiquer ce que permet ce schéma",
            "options": {
              "orientation": "Orientation nord en haut",
              "island": "Position de l’île représentée",
              "tide": "Marge réelle de marée garantie"
            }
          },
          "marks": {
            "label": "Classer les marques ambrées",
            "options": {
              "targets": "Cibles d’entraînement",
              "iala": "Balisage IALA complet",
              "safe": "Preuve d’eaux sûres"
            }
          }
        }
      },
      "route": {
        "title": "Construire une route dégagée",
        "brief": "Allez de S à F par le corridor inférieur. Tous les segments doivent éviter l’île.",
        "goal": "Validez la séquence des points passant par A et B.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "route": {
            "label": "Exigence de la route",
            "text": "Partez de S, passez par A puis B dans le corridor inférieur et terminez en F. X est dans l’île et n’est pas sûr."
          }
        },
        "fields": {
          "route": {
            "label": "Points de route ordonnés",
            "options": {
              "S": "S",
              "A": "A",
              "B": "B",
              "F": "F",
              "X": "X"
            }
          }
        }
      },
      "transfer": {
        "title": "Préparer la demande de carte réelle",
        "brief": "La route évite l’île dessinée. Cela ne suffit pas à autoriser une traversée réelle.",
        "goal": "Demandez les informations manquantes avant toute navigation réelle.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "status": {
            "label": "Schéma terminé",
            "text": "La route tracée est géométriquement dégagée dans l’exercice fictif. Les profondeurs et dangers réels ne sont pas validés."
          }
        },
        "fields": {
          "request": {
            "label": "Demander avant usage réel",
            "options": {
              "chart": "Carte officielle adaptée et à jour, avec avis",
              "tide": "Informations compatibles de marée et de profondeur",
              "rules": "Informations locales de navigation applicables",
              "approve": "Autoriser sur le seul schéma pédagogique"
            }
          }
        }
      }
    }
  },
  "decision-sail-23": {
    "title": "Tenir le journal des durées de traversée",
    "brief": "Calculez deux étapes, validez une arrivée et révisez-la selon la progression réelle.",
    "limitations": "Le journal évalue les calculs et mises à jour sous hypothèses données. Les estimations réelles intègrent changements et incertitude.",
    "stages": {
      "legs": {
        "title": "Calculer les étapes prévues",
        "brief": "Les deux étapes utilisent une vitesse fond constante de 4 nœuds pour cet exercice.",
        "goal": "Saisissez la durée de chaque étape en minutes.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "legs": {
            "label": "Fiche de route",
            "text": "L’étape A fait 3 NM et B fait 2 NM. L’estimation initiale exclut courant, arrêts et variations de vitesse."
          }
        },
        "fields": {
          "legA": {
            "label": "Durée de l’étape A",
            "options": {}
          },
          "legB": {
            "label": "Durée de l’étape B",
            "options": {}
          }
        }
      },
      "arrival": {
        "title": "Valider l’arrivée estimée",
        "brief": "Utilisez les deux durées dans un seul journal de traversée.",
        "goal": "Notez la durée totale et l’arrivée en minutes après 13:00.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "departure": {
            "label": "Journal de départ",
            "text": "Le départ est à 13:00. Les durées prévues sont de 45 et 30 minutes."
          }
        },
        "fields": {
          "total": {
            "label": "Durée totale prévue",
            "options": {}
          },
          "arrivalMinutes": {
            "label": "Arrivée : minutes après 13:00",
            "options": {}
          }
        }
      },
      "update": {
        "title": "Actualiser après un retard",
        "brief": "La première étape a duré plus que prévu. Conservez les hypothèses de la seconde.",
        "goal": "Remplacez l’arrivée prévue par l’estimation issue de la progression observée.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "actual": {
            "label": "Journal réel",
            "text": "L’étape A s’est terminée à 14:00 après 60 minutes. B exige toujours 30 minutes."
          },
          "deadline": {
            "label": "Marge d’arrivée",
            "text": "L’heure limite d’arrivée de l’exercice est 15:00."
          }
        },
        "fields": {
          "arrivalMinutes": {
            "label": "Arrivée révisée : minutes après 13:00",
            "options": {}
          },
          "reserve": {
            "label": "Minutes restantes avant 15:00",
            "options": {}
          }
        }
      }
    }
  },
  "decision-sail-25": {
    "title": "Établir un rapport de veille",
    "brief": "Inspectez les secteurs, comparez les observations successives et maintenez le suivi des risques non résolus.",
    "limitations": "Évalue l’interprétation d’observations fournies, pas la détection visuelle en temps réel ni les manœuvres physiques anticollision.",
    "stages": {
      "scan": {
        "title": "Recueillir les observations",
        "brief": "Une voile masque une partie de la vue avant. Utilisez les informations disponibles dans tous les secteurs.",
        "goal": "Notez le secteur masqué et complétez le rapport.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "ahead": {
            "label": "Secteur avant",
            "text": "Un contact est devant, au relèvement compas 045°. Une voile masque une partie de la vue."
          },
          "port": {
            "label": "Secteur bâbord",
            "text": "Aucun contact n’est signalé sur cette observation."
          },
          "starboard": {
            "label": "Secteur tribord",
            "text": "Un navire éloigné est visible ; aucune tendance de déplacement n’est encore connue."
          },
          "astern": {
            "label": "Secteur arrière",
            "text": "L’eau derrière est dégagée sur cette observation."
          }
        },
        "fields": {
          "obstruction": {
            "label": "Secteur nécessitant un autre point d’observation",
            "options": {
              "ahead": "Devant",
              "astern": "Derrière",
              "none": "Aucun"
            }
          },
          "means": {
            "label": "Utiliser pour la veille continue",
            "options": {
              "sight": "Observations visuelles depuis un poste dégagé",
              "hearing": "Ouïe",
              "appropriate": "Autres moyens appropriés disponibles",
              "aisOnly": "AIS seul"
            }
          }
        }
      },
      "trend": {
        "title": "Comparer le journal des contacts",
        "brief": "Deux observations ajoutent des informations de mouvement au premier repérage.",
        "goal": "Signalez le contact dont le relèvement varie peu alors que la distance diminue.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "a": {
            "label": "Contact A",
            "text": "Minute 0 : relèvement 045°, distance 0,8 NM. Minute 2 : relèvement 045°, distance 0,5 NM."
          },
          "b": {
            "label": "Contact B",
            "text": "Une seule observation est disponible. La future distance de passage est inconnue."
          }
        },
        "fields": {
          "risk": {
            "label": "Signaler la tendance dangereuse de rapprochement démontrée",
            "options": {
              "A": "Contact A",
              "B": "Contact B seulement",
              "none": "Aucun contact"
            }
          },
          "unknown": {
            "label": "État du contact B",
            "options": {
              "clear": "Passage sûr démontré",
              "observe": "Nécessite d’autres observations",
              "ignore": "L’ignorer car il est éloigné"
            }
          }
        }
      },
      "recheck": {
        "title": "Continuer à évaluer le risque",
        "brief": "Une nouvelle observation arrive avant que l’issue du passage soit connue.",
        "goal": "Actualisez sans déclarer sûr un contact non résolu.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "new": {
            "label": "Nouvelle observation",
            "text": "Le contact A est maintenant à 0,3 NM au 045°. Il reste devant ; aucun passage sûr n’est établi."
          }
        },
        "fields": {
          "status": {
            "label": "État du contact A",
            "options": {
              "risk": "Le risque d’abordage persiste",
              "clear": "Sûr puisqu’il a déjà été observé",
              "finished": "Rapport terminé"
            }
          },
          "next": {
            "label": "Prochaine exigence du rapport",
            "options": {
              "monitor": "Poursuivre la veille systématique et évaluer une action à temps",
              "close": "Clore le journal des contacts",
              "screen": "Regarder seulement le traceur"
            }
          }
        }
      }
    }
  },
  "decision-sail-26": {
    "title": "Attribuer les responsabilités de rencontre",
    "brief": "Utilisez trois schémas de rencontre précisément définis pour attribuer les responsabilités et suivre l’issue.",
    "limitations": "Ces schémas enseignent des responsabilités précises. Ils ne prescrivent aucun virage universel et ne remplacent pas les règles complètes applicables.",
    "stages": {
      "opposite": {
        "title": "Attribuer les rôles sur des bords opposés",
        "brief": "Deux voiliers sont en vue l’un de l’autre en eaux libres.",
        "goal": "Attribuez la responsabilité initiale de s’écarter.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "scope": {
            "label": "Cadre de l’exercice",
            "text": "Règles internationales ; aucun ne rattrape l’autre ; ni chenal étroit, ni dispositif de trafic, ni statut particulier de navire."
          },
          "tacks": {
            "label": "Rencontre A",
            "text": "Votre yacht est bâbord amures. L’autre est tribord amures et un risque d’abordage existe."
          }
        },
        "fields": {
          "giveWay": {
            "label": "Navire devant initialement s’écarter",
            "options": {
              "own": "Votre yacht",
              "other": "L’autre yacht",
              "neither": "Aucun des deux"
            }
          },
          "follow": {
            "label": "Après votre manœuvre d’évitement",
            "options": {
              "monitor": "Vérifier son effet jusqu’à être définitivement paré et clair",
              "stop": "Cesser d’observer dès que la barre bouge",
              "priority": "Revendiquer une priorité permanente"
            }
          }
        }
      },
      "same": {
        "title": "Attribuer les rôles sur le même bord",
        "brief": "Le deuxième schéma montre deux voiliers sur le même bord.",
        "goal": "Attribuez au navire au vent l’obligation de s’écarter.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "same": {
            "label": "Rencontre B",
            "text": "Les deux sont tribord amures. Votre yacht est au vent, l’autre sous le vent. Les autres hypothèses restent inchangées."
          }
        },
        "fields": {
          "giveWay": {
            "label": "Navire devant s’écarter",
            "options": {
              "own": "Votre yacht au vent",
              "other": "L’autre yacht sous le vent",
              "neither": "Aucun des deux"
            }
          },
          "standOn": {
            "label": "Responsabilité de l’autre navire",
            "options": {
              "none": "Aucune autre responsabilité",
              "watch": "Respecter ses obligations et agir si nécessaire pour éviter l’abordage",
              "ignore": "Ignorer le yacht qui approche"
            }
          }
        }
      },
      "overtake": {
        "title": "Appliquer le cas du rattrapage",
        "brief": "La rencontre change sur le dernier schéma : votre yacht rattrape l’autre.",
        "goal": "Distinguez l’obligation du navire rattrapant des simples règles d’amures.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "overtake": {
            "label": "Rencontre C",
            "text": "Votre yacht approche depuis le secteur de rattrapage arrière. Vous êtes le navire rattrapant, indépendamment des amures."
          }
        },
        "fields": {
          "giveWay": {
            "label": "Navire devant s’écarter",
            "options": {
              "own": "Votre yacht rattrapant",
              "other": "Le navire rattrapé",
              "tack": "Toujours celui bâbord amures"
            }
          },
          "end": {
            "label": "Quand l’évaluation du rattrapage peut-elle se terminer ?",
            "options": {
              "clear": "Une fois définitivement paré et clair",
              "abeam": "Dès qu’on est par le travers",
              "signal": "Immédiatement après un signal"
            }
          }
        }
      }
    }
  },
  "decision-sail-27": {
    "title": "Établir un rapport de feux et signaux",
    "brief": "Séparez les feux observés des conclusions et préparez le journal des signaux selon les règles indiquées.",
    "limitations": "L’exercice couvre quelques identifications. Il n’enseigne pas tout le programme des feux, marques et signaux sonores.",
    "stages": {
      "lights": {
        "title": "Consigner ce qui est réellement visible",
        "brief": "Vous voyez les feux de côté rouge et vert devant, mais le reste est masqué.",
        "goal": "Notez l’aspect sans inventer le type de navire ni sa priorité.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "view": {
            "label": "Ensemble visible",
            "text": "Les deux feux de côté sont visibles. Les feux de tête de mât, de poupe ou de statut particulier restent non confirmés."
          },
          "limit": {
            "label": "Limite d’identification",
            "text": "Les seuls feux de côté n’établissent pas complètement le type ni l’état opérationnel du navire."
          }
        },
        "fields": {
          "aspect": {
            "label": "Aspect observé",
            "options": {
              "ahead": "Vue approximativement de l’avant",
              "stern": "Vue uniquement de sa poupe",
              "none": "Aucune observation utile"
            }
          },
          "status": {
            "label": "Rapport sur le type de navire",
            "options": {
              "unknown": "Informations insuffisantes ; obtenir l’ensemble complet",
              "sail": "Certainement un voilier",
              "power": "Certainement un navire à moteur"
            }
          }
        }
      },
      "sounds": {
        "title": "Compléter le journal des signaux de manœuvre",
        "brief": "Utilisez le cadre international indiqué des signaux de manœuvre entre navires en vue.",
        "goal": "Associez les trois signaux sonores à leur signification.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "signals": {
            "label": "Référence des signaux",
            "text": "Un son bref : je viens sur tribord. Deux : je viens sur bâbord. Trois : je bats en arrière."
          }
        },
        "fields": {
          "one": {
            "label": "Un son bref",
            "options": {
              "starboard": "Venir sur tribord",
              "port": "Venir sur bâbord",
              "astern": "Battre en arrière"
            }
          },
          "two": {
            "label": "Deux sons brefs",
            "options": {
              "starboard": "Venir sur tribord",
              "port": "Venir sur bâbord",
              "astern": "Battre en arrière"
            }
          },
          "three": {
            "label": "Trois sons brefs",
            "options": {
              "moving": "Mouvement arrière garanti",
              "astern": "Battre en arrière",
              "stopped": "Déjà arrêté"
            }
          }
        }
      },
      "context": {
        "title": "Gérer un changement de contexte des signaux",
        "brief": "Le brouillard masque l’autre navire. La fiche précédente des signaux de manœuvre n’est plus un guide complet.",
        "goal": "Actualisez le contexte et les informations nécessaires.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "fog": {
            "label": "Actualisation de la visibilité",
            "text": "L’autre navire n’est plus en vue. Les signaux de visibilité réduite s’appliquent selon son type et son activité."
          },
          "jurisdiction": {
            "label": "Note d’application",
            "text": "L’exercice utilise les règles internationales ; les règles intérieures et locales applicables doivent aussi être vérifiées avant un voyage réel."
          }
        },
        "fields": {
          "context": {
            "label": "Quel cadre de signaux utiliser ?",
            "options": {
              "restricted": "Les signaux applicables en visibilité réduite",
              "same": "Seulement la fiche précédente à un, deux ou trois sons",
              "none": "Aucune exigence sonore"
            }
          },
          "verify": {
            "label": "Vérifier avant usage réel",
            "options": {
              "type": "Type de navire et état opérationnel",
              "rules": "Ensemble des règles applicables",
              "guess": "Deviner avec une seule couleur de feu"
            }
          }
        }
      }
    }
  },
  "decision-sail-28": {
    "title": "Réviser une traversée retardée",
    "brief": "Choisissez une destination selon les limites d’arrivée et actualisez le plan si la progression ralentit.",
    "limitations": "C’est un exercice de gestion de traversée avec horaires fournis. Il n’évalue ni navigation ni météo réelles.",
    "stages": {
      "compare": {
        "title": "Comparer les marges des destinations",
        "brief": "L’équipage débutant a convenu d’une heure limite et dispose de deux destinations.",
        "goal": "Calculez le temps disponible pour chaque option.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "clock": {
            "label": "Heure de décision",
            "text": "Il est 16:00. L’heure limite d’arrivée convenue est 17:00."
          },
          "routes": {
            "label": "Estimations actuelles",
            "text": "La destination exposée est à 45 minutes et l’alternative abritée à 25."
          }
        },
        "fields": {
          "exposedMargin": {
            "label": "Marge de la destination exposée",
            "options": {}
          },
          "shelterMargin": {
            "label": "Marge de l’alternative abritée",
            "options": {}
          }
        }
      },
      "delay": {
        "title": "Appliquer le rapport de progression ralentie",
        "brief": "Les estimations changent à 16:10.",
        "goal": "Choisissez une destination respectant encore l’accord.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "update": {
            "label": "Estimations actualisées",
            "text": "La destination exposée exige maintenant 70 minutes, arrivée à 17:20. L’abri exige 35 minutes, arrivée à 16:45."
          }
        },
        "fields": {
          "destination": {
            "label": "Valider la destination",
            "options": {
              "exposed": "Destination exposée",
              "shelter": "Alternative abritée"
            }
          },
          "reserve": {
            "label": "Marge d’arrivée à l’abri choisi",
            "options": {}
          }
        }
      },
      "brief": {
        "title": "Actualiser le plan pour l’équipage et la terre",
        "brief": "Vous avez choisi l’alternative abritée. Validez les informations modifiées.",
        "goal": "Communiquez destination, arrivée estimée et motif sans supprimer la limite.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "plan": {
            "label": "Plan révisé",
            "text": "Destination : alternative abritée. Arrivée 16:45. Motif : la destination exposée ne respecte plus la limite de 17:00."
          }
        },
        "fields": {
          "updates": {
            "label": "Actualiser ces éléments",
            "options": {
              "destination": "Destination et route",
              "eta": "Arrivée estimée et contact à terre concerné",
              "crew": "Rôles de l’équipage et briefing d’approche révisé",
              "limit": "Supprimer la limite d’arrivée"
            }
          },
          "reason": {
            "label": "Consigner le motif de la décision",
            "options": {
              "margin": "Conserver la marge d’arrivée convenue",
              "promise": "Tenir la promesse initiale à tout prix",
              "speed": "La route apparemment la plus rapide est toujours la plus sûre"
            }
          }
        }
      }
    }
  },
  "decision-sail-29": {
    "title": "Préparer et interrompre une approche",
    "brief": "Préparez un accostage tribord à quai, organisez l’équipage et réagissez à une obstruction avant de vous engager.",
    "limitations": "Seuls la préparation et les choix d’équipage sont évalués. Pas de pas d’hélice, de contact, de maniement des gardes ni de compétence réelle d’accostage.",
    "stages": {
      "prepare": {
        "title": "Préparer le côté d’accostage",
        "brief": "Le plan fourni amène tribord à quai.",
        "goal": "Placez défenses et amarres du côté prévu.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "berth": {
            "label": "Plan d’accostage",
            "text": "Tribord à quai. Préparez pointes avant, arrière et gardes selon la procédure du bateau avant l’approche."
          },
          "crew": {
            "label": "Sécurité de l’équipage",
            "text": "Personne ne doit sauter à terre ni placer mains ou pieds entre yacht et quai."
          }
        },
        "fields": {
          "fenders": {
            "label": "Côté des défenses",
            "options": {
              "starboard": "Tribord",
              "port": "Bâbord",
              "none": "Sans défenses"
            }
          },
          "lines": {
            "label": "Préparer les amarres indiquées",
            "options": {
              "bow": "Pointe avant",
              "stern": "Pointe arrière",
              "spring": "Gardes",
              "body": "Utiliser le corps d’un équipier comme défense"
            }
          }
        }
      },
      "roles": {
        "title": "Expliquer l’approche et le dégagement",
        "brief": "Répartissez commande, observation et amarres avant d’entamer l’approche.",
        "goal": "Conservez une voie de dégagement libre et des rôles sûrs.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "roles": {
            "label": "Plan d’équipage",
            "text": "Alex barre. Sam annonce les distances et surveille le dégagement. Jo manie les amarres préparées depuis une position sûre sur ordre."
          },
          "escape": {
            "label": "Voie de dégagement",
            "text": "Un corridor d’eau libre à bâbord est disponible avant l’approche finale. Aucun contact avec le quai n’est requis."
          }
        },
        "fields": {
          "observer": {
            "label": "Tâche de Sam",
            "options": {
              "watch": "Annoncer les distances et surveiller le dégagement",
              "jump": "Sauter sur le quai",
              "push": "Repousser le yacht à la main"
            }
          },
          "escape": {
            "label": "Consigner la voie de dégagement",
            "options": {
              "port": "Eau libre à bâbord avant l’approche finale",
              "blocked": "La place occupée",
              "none": "Aucun dégagement nécessaire"
            }
          }
        }
      },
      "obstruction": {
        "title": "Interrompre avant de s’engager",
        "brief": "La place est obstruée et l’approche n’est plus acceptable.",
        "goal": "Utilisez le dégagement prévu tant qu’il reste libre.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "change": {
            "label": "Nouveau rapport",
            "text": "Une obstruction occupe la place. Le corridor libre à bâbord prévu au briefing reste ouvert."
          },
          "limit": {
            "label": "Limite de commande",
            "text": "C’est un plan décisionnel ; les forces du moteur et des bouts et le contact avec le quai ne sont pas évalués."
          }
        },
        "fields": {
          "action": {
            "label": "Valider la décision d’approche",
            "options": {
              "abort": "Interrompre par le corridor vérifié et réévaluer",
              "force": "Continuer et demander d’arrêter physiquement le bateau",
              "speed": "Accélérer vers l’obstruction"
            }
          },
          "crew": {
            "label": "Consigne à l’équipage",
            "options": {
              "safe": "Rester aux postes sûrs et suivre le briefing de dégagement",
              "jump": "Sauter rapidement à terre",
              "hands": "Mettre les mains entre coque et quai"
            }
          }
        }
      }
    }
  },
  "decision-sail-30": {
    "title": "Évaluer un mouillage au fil de la marée",
    "brief": "Choisissez un site, calculez la ligne demandée et révisez l’évitage à marée montante.",
    "limitations": "Le rapport et l’enveloppe prudente sont des hypothèses d’exercice. Ils ne prouvent pas la tenue, ne prescrivent pas de longueur réelle et ne modélisent pas la chaînette.",
    "stages": {
      "site": {
        "title": "Comparer les fiches de mouillage",
        "brief": "Utilisez les indications de l’ancre et l’exigence d’abri.",
        "goal": "Choisissez le site respectant toutes les conditions indiquées.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "guidance": {
            "label": "Indications de l’ancre de l’exercice",
            "text": "L’ancre fournie convient au fond sableux représenté. L’équipage exige un abri du vent prévu et au moins 40 m de rayon d’évitage libre pour le plan initial."
          },
          "sites": {
            "label": "Rapports des sites",
            "text": "A : sable abrité, rayon libre 60 m. B : roche exposée, 70 m. C : sable abrité, 35 m."
          }
        },
        "fields": {
          "site": {
            "label": "Choisir le mouillage",
            "options": {
              "A": "A : sable abrité, 60 m",
              "B": "B : roche exposée, 70 m",
              "C": "C : sable abrité, 35 m"
            }
          }
        }
      },
      "rode": {
        "title": "Calculer l’enveloppe initiale",
        "brief": "Appliquez la règle arithmétique fournie, hauteur du davier comprise.",
        "goal": "Calculez la ligne et le rayon prudent de planification.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "initial": {
            "label": "Données initiales",
            "text": "Profondeur 5 m ; davier 1 m au-dessus de l’eau ; rapport d’exercice 5:1 ; longueur du yacht 10 m."
          },
          "radius": {
            "label": "Enveloppe prudente de l’exercice",
            "text": "Pour cette fiche seulement, utilisez la longueur de ligne plus celle du yacht comme rayon d’évitage prévu."
          }
        },
        "fields": {
          "rode": {
            "label": "Longueur de ligne de mouillage",
            "options": {}
          },
          "radius": {
            "label": "Rayon d’évitage prévu",
            "options": {}
          }
        }
      },
      "tide": {
        "title": "Réviser à pleine mer",
        "brief": "La prévision de marée ajoute 2 m de profondeur.",
        "goal": "Actualisez la ligne et vérifiez que l’enveloppe tient toujours dans le site.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "rise": {
            "label": "Profondeur modifiée",
            "text": "La profondeur passe à 7 m. Hauteur du davier, rapport 5:1 et longueur de 10 m restent inchangés."
          },
          "room": {
            "label": "Site choisi",
            "text": "Le site A conserve un rayon libre de 60 m sur cette carte fictive."
          }
        },
        "fields": {
          "rode": {
            "label": "Longueur de ligne actualisée",
            "options": {}
          },
          "radius": {
            "label": "Rayon prévu actualisé",
            "options": {}
          },
          "fit": {
            "label": "Vérification de l’enveloppe",
            "options": {
              "fits": "50 m tiennent dans le rayon libre indiqué de 60 m",
              "same": "Aucun nouveau calcul nécessaire",
              "guarantee": "Cela prouve que l’ancre réelle tiendra"
            }
          }
        }
      }
    }
  },
  "decision-sail-33": {
    "title": "Coordonner la réponse à une personne à la mer",
    "brief": "Répartissez les rôles immédiats, évaluez la capacité de récupération et préparez la suite sans prétendre effectuer un sauvetage.",
    "limitations": "Évalue la coordination d’urgence et la révision du plan, pas les manœuvres, la récupération, les premiers secours ni l’usage sûr du matériel réel.",
    "stages": {
      "immediate": {
        "title": "Répartir les actions immédiates",
        "brief": "Une personne est tombée à la mer. Trois équipiers restent à bord.",
        "goal": "Maintenez l’observation tout en répartissant alerte et flottabilité.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "crew": {
            "label": "Équipage disponible",
            "text": "Alex est à la barre. Sam garde le contact visuel. Jo est près du matériel de flottabilité et de repérage."
          },
          "priority": {
            "label": "Priorités immédiates",
            "text": "Donnez l’alerte, gardez le contact visuel et fournissez flottabilité et repérage adaptés. Ces actions peuvent être simultanées ; n’abandonnez pas la veille."
          }
        },
        "fields": {
          "sam": {
            "label": "Affecter Sam",
            "options": {
              "spot": "Continuer à pointer et garder le contact visuel",
              "leave": "Quitter la veille pour chercher sous le pont",
              "swim": "Sauter à l’eau après la personne"
            }
          },
          "jo": {
            "label": "Affecter Jo",
            "options": {
              "alarmFloat": "Donner l’alerte et mettre à l’eau flottabilité et repérage adaptés",
              "wait": "Attendre la fin de la manœuvre de retour",
              "photo": "Photographier l’incident"
            }
          }
        }
      },
      "capability": {
        "title": "Vérifier la capacité de récupération",
        "brief": "La personne reste visible, mais l’équipage ne peut pas hisser seul une victime inconsciente.",
        "goal": "Organisez de l’aide et gardez un observateur dédié en préparant la récupération.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "casualty": {
            "label": "Rapport sur la victime",
            "text": "La personne semble incapable d’aider. L’équipage ne peut pas la hisser en sécurité avec ses capacités actuelles."
          },
          "equipment": {
            "label": "Rapport matériel",
            "text": "Un système de récupération propre au bateau est disponible, mais exige une manipulation formée. Des communications sont disponibles."
          }
        },
        "fields": {
          "actions": {
            "label": "Valider les priorités suivantes",
            "options": {
              "help": "Demander une assistance immédiate adaptée",
              "spotter": "Maintenir un observateur dédié",
              "plan": "Préparer le plan de récupération propre au bateau",
              "alone": "Supposer qu’arriver à côté termine la récupération"
            }
          }
        }
      },
      "recovery": {
        "title": "Réviser le plan de récupération",
        "brief": "Un plan prévoit de laisser l’hélice tourner près de la victime et s’arrête avant de la hisser à bord.",
        "goal": "Refusez cette proximité dangereuse et incluez la récupération physique.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "proposal": {
            "label": "Défauts du plan",
            "text": "La proposition permet une propulsion tournante près de la victime et ne prévoit aucun moyen de la remonter."
          },
          "boundary": {
            "label": "Limite de l’exercice",
            "text": "Ni la manœuvre de retour ni le hissage de la victime ne sont simulés ici."
          }
        },
        "fields": {
          "corrections": {
            "label": "Corrections nécessaires",
            "options": {
              "propeller": "Prévenir les blessures d’hélice selon la procédure adaptée du bateau",
              "lift": "Prévoir un hissage ou une récupération sûre avec aide et matériel adaptés",
              "contact": "Maintenir l’observation tout au long de l’opération",
              "accept": "Accepter le plan incomplet"
            }
          }
        }
      }
    }
  },
  "decision-sail-34": {
    "title": "Préparer un message d’urgence",
    "brief": "Lisez un incident évolutif, construisez une fiche de détresse hors ligne et actualisez-la selon les rapports. Aucune transmission n’a lieu.",
    "limitations": "C’est un exercice hors ligne de préparation de messages. Il ne commande aucune radio, n’émet aucune détresse et ne qualifie pas à utiliser une radio.",
    "stages": {
      "classify": {
        "title": "Classer l’incident en cours",
        "brief": "Évaluez la gravité de l’incident, pas le désagrément du retard.",
        "goal": "Choisissez le niveau adapté à un danger grave et imminent.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "incident": {
            "label": "Incident d’entraînement",
            "text": "Meridian subit une voie d’eau incontrôlée. L’équipage ne maîtrise pas l’entrée d’eau et nécessite une aide extérieure immédiate."
          },
          "radio": {
            "label": "Exercice hors ligne",
            "text": "La fiche radio est simulée. N’émettez jamais une véritable alerte de détresse pour vous entraîner."
          }
        },
        "fields": {
          "urgency": {
            "label": "Priorité du message",
            "options": {
              "distress": "Détresse : danger grave et imminent exigeant une assistance immédiate",
              "routine": "Actualisation courante de l’arrivée",
              "none": "Aucun appel nécessaire"
            }
          },
          "facility": {
            "label": "Procédure d’entraînement applicable",
            "options": {
              "distress": "Procédure de détresse ASN adaptée et MAYDAY sur VHF 16 lorsque disponibles et applicables",
              "test": "Émettre une vraie alerte pour tester",
              "social": "Publier seulement sur les réseaux sociaux"
            }
          }
        }
      },
      "message": {
        "title": "Compléter la fiche de détresse",
        "brief": "Utilisez la fiche actuelle de l’incident pour renseigner les champs essentiels.",
        "goal": "Notez identité, position, urgence et aide nécessaire.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "identity": {
            "label": "Fiche d’identité",
            "text": "Nom du navire : Meridian. Ce nom est fictif pour l’entraînement."
          },
          "position": {
            "label": "Fiche de position",
            "text": "Position d’entraînement : 36°10.0′N, 005°20.0′W, relevée à 12:10 UTC."
          },
          "incident": {
            "label": "Fiche d’incident",
            "text": "Voie d’eau incontrôlée ; trois personnes à bord ; assistance immédiate et aide à la récupération nécessaires."
          }
        },
        "fields": {
          "identity": {
            "label": "Identité du navire",
            "options": {
              "meridian": "Meridian",
              "unknown": "Inconnue malgré la fiche d’identité",
              "other": "Un autre navire"
            }
          },
          "position": {
            "label": "Position à communiquer",
            "options": {
              "current": "36°10.0′N, 005°20.0′W à 12:10 UTC",
              "old": "Place de départ d’hier",
              "omit": "Omettre la position"
            }
          },
          "details": {
            "label": "Inclure ces détails de l’incident",
            "options": {
              "flood": "Voie d’eau incontrôlée",
              "people": "Trois personnes à bord",
              "help": "Assistance immédiate et aide à la récupération nécessaires",
              "arrived": "Tous arrivés en sécurité"
            }
          }
        }
      },
      "update": {
        "title": "Actualiser le journal du message",
        "brief": "L’équipage attend de l’aide. Un relevé de position plus récent est disponible.",
        "goal": "Utilisez les informations horodatées les plus récentes et continuez à surveiller l’urgence.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "newPosition": {
            "label": "Position actualisée",
            "text": "À 12:15 UTC, la position d’entraînement est 36°10.1′N, 005°19.8′W. La voie d’eau reste incontrôlée ; les trois personnes restent à bord."
          },
          "status": {
            "label": "Situation actuelle",
            "text": "La position de 12:10 est désormais historique, pas la plus récente."
          }
        },
        "fields": {
          "position": {
            "label": "Mise à jour de position",
            "options": {
              "new": "36°10.1′N, 005°19.8′W à 12:15 UTC",
              "old": "Répéter seulement l’ancienne position",
              "none": "Cesser d’actualiser la position"
            }
          },
          "continue": {
            "label": "Poursuivre la réponse",
            "options": {
              "people": "Protéger et dénombrer les personnes",
              "updates": "Informer le service d’assistance selon les besoins",
              "procedure": "Suivre les procédures d’urgence du bateau",
              "power": "Mettre plein gaz sans évaluer les dégâts"
            }
          }
        }
      }
    }
  },
  "decision-sail-36": {
    "title": "Examiner vos preuves et votre plan de formation",
    "brief": "Examinez un dossier d’exemple, identifiez les éléments non évalués et préparez un bilan utile à un instructeur.",
    "limitations": "Évalue un classement honnête des preuves et un plan de formation. Ne délivre ni permis, certificat, temps de mer ni compétence physique.",
    "stages": {
      "audit": {
        "title": "Classer les preuves d’exemple",
        "brief": "Utilisez seulement ce que le dossier établit réellement.",
        "goal": "Distinguez connaissances, performance du modèle et gestes physiques.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "record": {
            "label": "Dossier d’élève fictif",
            "text": "Un questionnaire de trafic et un virement ordonné du modèle sont réussis. Accostage et hissage d’une victime ont seulement été discutés."
          },
          "scope": {
            "label": "Catégories de preuves",
            "text": "Les questionnaires évaluent les réponses et les tâches du modèle les états simulés ; aucun ne démontre des gestes physiques non pratiqués."
          }
        },
        "fields": {
          "traffic": {
            "label": "Preuve du questionnaire de trafic",
            "options": {
              "knowledge": "Contrôle des connaissances",
              "model": "Manœuvre mesurée du modèle",
              "physical": "Compétence physique"
            }
          },
          "tack": {
            "label": "Preuve du virement ordonné du modèle",
            "options": {
              "knowledge": "Connaissances seulement",
              "model": "Performance mesurée du modèle",
              "physical": "Manœuvre validée d’un vrai yacht"
            }
          },
          "docking": {
            "label": "Preuve d’accostage physique",
            "options": {
              "done": "Établie",
              "missing": "Non évaluée",
              "automatic": "Déduite du résultat du virement"
            }
          }
        }
      },
      "plan": {
        "title": "Préparer la demande de formation encadrée",
        "brief": "Ciblez les gestes physiques que le dossier ne démontre pas.",
        "goal": "Incluez les domaines pratiques manquants dans la demande d’évaluation encadrée.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "gaps": {
            "label": "Domaines physiques non évalués",
            "text": "Bouts sous charge, accostage et hissage d’une victime restent non évalués. Le dossier du virement simulé peut servir à la discussion."
          }
        },
        "fields": {
          "request": {
            "label": "Demander une pratique encadrée de",
            "options": {
              "lines": "Maniement des bouts sous tension et des winchs",
              "dock": "Manœuvre au moteur et accostage réel",
              "recovery": "Récupération d’une victime propre au bateau",
              "license": "Permis automatique de chef de bord par l’application"
            }
          }
        }
      },
      "brief": {
        "title": "Préparer le bilan pour l’instructeur",
        "brief": "Résumez honnêtement sans revendiquer de qualifications réelles.",
        "goal": "Incluez preuves observées, limites et prochaine évaluation demandée.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "handover": {
            "label": "Transmission utile",
            "text": "L’instructeur a besoin de l’expérience préalable, du dossier simulé, des difficultés et aides utilisées, et des objectifs pratiques demandés."
          }
        },
        "fields": {
          "brief": {
            "label": "Inclure dans le bilan",
            "options": {
              "record": "Dossier de connaissances et de tâches simulées",
              "limits": "Tâches non évaluées et limites du modèle",
              "help": "Difficultés et aides utilisées",
              "goals": "Objectifs de pratique encadrée",
              "certified": "Revendiquer un statut certifié de chef de bord autonome"
            }
          }
        }
      }
    }
  },
  "decision-sail-37": {
    "title": "Préserver une solution de dégagement côtier",
    "brief": "Construisez une route côtière, calculez le dernier point de déroutement et changez le plan si la marge disparaît.",
    "limitations": "C’est un problème fictif de route et d’horaires. Il n’établit ni pilotage sûr, ni limites météo réelles, ni précision de carte.",
    "stages": {
      "route": {
        "title": "Construire la route côtière",
        "brief": "Passez par la bifurcation D avant le cap exposé ; utilisez B pour éviter le danger.",
        "goal": "Validez toute la route de S à F par D et B.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "route": {
            "label": "Consignes de route",
            "text": "S est le départ. D est la bifurcation. B dégage le cap. F est la destination exposée. H est l’abri accessible depuis D."
          }
        },
        "fields": {
          "route": {
            "label": "Route principale ordonnée",
            "options": {
              "S": "S",
              "D": "D",
              "B": "B",
              "F": "F",
              "H": "H"
            }
          }
        }
      },
      "margin": {
        "title": "Fixer la limite au point de décision",
        "brief": "La dernière étape exposée a une heure limite d’arrivée.",
        "goal": "Calculez le dernier départ de D et la marge prévue.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "timing": {
            "label": "Horaires de traversée",
            "text": "L’étape exposée D–F dure 90 minutes. L’arrivée est exigée avant 16:00. L’arrivée prévue à D est 14:00."
          },
          "escape": {
            "label": "Disponibilité du déroutement",
            "text": "L’alternative vérifiée D–H dure 30 minutes et reste acceptable après 14:30."
          }
        },
        "fields": {
          "latest": {
            "label": "Dernier départ de D : minutes après 14:00",
            "options": {}
          },
          "margin": {
            "label": "Marge prévue à D",
            "options": {}
          }
        }
      },
      "divert": {
        "title": "Agir à la bifurcation",
        "brief": "La progression lente fait arriver à D plus tard que prévu.",
        "goal": "Utilisez l’abri encore disponible et notez la nouvelle arrivée.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "actual": {
            "label": "Arrivée réelle à D",
            "text": "Le yacht atteint D à 14:40. L’étape exposée dure toujours 90 minutes et l’abri H est à 30 minutes."
          },
          "limit": {
            "label": "Limite d’arrivée inchangée",
            "text": "L’heure limite acceptable à la destination exposée reste 16:00."
          }
        },
        "fields": {
          "destination": {
            "label": "Valider l’étape suivante",
            "options": {
              "H": "Se dérouter vers l’abri H",
              "F": "Continuer vers la destination exposée F",
              "wait": "Attendre encore à la bifurcation"
            }
          },
          "arrival": {
            "label": "Arrivée à l’abri : minutes après 14:00",
            "options": {}
          }
        }
      }
    }
  },
  "decision-sail-38": {
    "title": "Choisir une fenêtre de franchissement avec marée",
    "brief": "Vérifiez les références compatibles, calculez la marge minimale de chaque fenêtre et réévaluez si la réserve d’incertitude change.",
    "limitations": "Zéro, marée et marges sont fictifs. Le calcul n’autorise aucun franchissement réel et ne modélise ni vagues, squat, erreurs de levé ni prévisions réelles.",
    "stages": {
      "reference": {
        "title": "Vérifier la référence verticale",
        "brief": "Deux tables de marée sont proposées, mais une seule correspond à la carte et au système horaire.",
        "goal": "Choisissez des données compatibles avant d’additionner les hauteurs.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "chart": {
            "label": "Carte et navire",
            "text": "Sonde de carte 2,1 m par rapport au zéro pédagogique T. Tirant d’eau 1,7 m. Heures UTC."
          },
          "tables": {
            "label": "Tables disponibles",
            "text": "La table A utilise le zéro T et UTC pour ce lieu et cette date. B utilise un autre zéro et l’heure locale sans conversion."
          }
        },
        "fields": {
          "table": {
            "label": "Utiliser cette table de marée",
            "options": {
              "A": "Table A : zéro, lieu, date et UTC compatibles",
              "B": "Table B : autre zéro et heure locale inexpliquée",
              "either": "Les hauteurs des deux tables sont interchangeables"
            }
          },
          "draft": {
            "label": "Consigner le tirant d’eau",
            "options": {}
          }
        }
      },
      "windows": {
        "title": "Calculer la marge minimale sous quille",
        "brief": "Utilisez la hauteur de marée la plus basse de chaque fenêtre complète de franchissement.",
        "goal": "Calculez les deux marges statiques minimales et choisissez la fenêtre admissible.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "tides": {
            "label": "Hauteurs de la table A",
            "text": "09:00 : 0,9 m ; 10:00 : 0,7 m ; 11:00 : 0,4 m ; 12:00 : 0,2 m. La baisse est supposée monotone entre les relevés."
          },
          "allowance": {
            "label": "Exigence de l’exercice",
            "text": "La marge totale exigée est 0,7 m. Comparez-la à la profondeur statique moins le tirant d’eau de 1,7 m ; la sonde de carte reste 2,1 m."
          }
        },
        "fields": {
          "earlyClearance": {
            "label": "Marge minimale 09:00–10:00",
            "options": {}
          },
          "lateClearance": {
            "label": "Marge minimale 11:00–12:00",
            "options": {}
          },
          "window": {
            "label": "Fenêtre respectant la marge indiquée",
            "options": {
              "early": "09:00–10:00",
              "late": "11:00–12:00",
              "both": "Les deux fenêtres"
            }
          }
        }
      },
      "uncertainty": {
        "title": "Réévaluer la marge augmentée",
        "brief": "L’exploitant augmente la marge totale après réexamen de l’incertitude.",
        "goal": "Comparez la fenêtre choisie au nouveau seuil et ne l’autorisez pas si elle échoue.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "revision": {
            "label": "Marge révisée",
            "text": "La marge totale exigée est désormais 1,2 m. La marge statique minimale de 09:00–10:00 reste 1,1 m."
          },
          "meaning": {
            "label": "Limite de décision",
            "text": "Un déficit impose de chercher une meilleure fenêtre ou route, pas d’effacer la marge."
          }
        },
        "fields": {
          "shortfall": {
            "label": "Déficit de marge",
            "options": {}
          },
          "decision": {
            "label": "Statut révisé du franchissement",
            "options": {
              "defer": "Ne pas autoriser ; chercher une fenêtre ou route respectant la marge",
              "go": "Poursuivre car la marge est positive",
              "ignore": "Ignorer l’incertitude révisée"
            }
          }
        }
      }
    }
  },
  "decision-sail-39": {
    "title": "Résoudre une traversée avec courant traversier",
    "brief": "Combinez les vecteurs vitesse, corrigez le cap et notez la durée obtenue.",
    "limitations": "C’est un exercice à vecteurs constants, pas des données réelles de courant de marée ni une garantie de vitesse réalisable.",
    "stages": {
      "drift": {
        "title": "Calculer le vecteur fond non corrigé",
        "brief": "Initialement, le yacht se déplace vers le nord dans l’eau tandis que le courant porte à l’est.",
        "goal": "Calculez route et vitesse fond avec les deux vecteurs perpendiculaires.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "vectors": {
            "label": "Données vectorielles",
            "text": "Bateau : 5 kn dans l’eau vers 000°. Courant : 3 kn vers 090°. Ignorez dérive de vent et accélération dans cet exercice."
          },
          "method": {
            "label": "Méthode de calcul",
            "text": "Vecteur fond = vitesse du bateau + courant. Composante nord 5, est 3. La vitesse est la norme ; la direction se mesure dans le sens horaire depuis le nord."
          }
        },
        "fields": {
          "groundSpeed": {
            "label": "Vitesse fond",
            "options": {}
          },
          "groundCourse": {
            "label": "Route fond",
            "options": {}
          }
        }
      },
      "correct": {
        "title": "Gouverner pour une route fond au nord",
        "brief": "Compensez le courant vers l’est par une composante du bateau vers l’ouest.",
        "goal": "Fixez le cap nord-ouest et la vitesse fond résultante vers le nord.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "solution": {
            "label": "Composantes nécessaires",
            "text": "Gardez 5 kn dans l’eau. Une composante ouest de 3 kn annule le courant. La composante nord restante est 4 kn."
          },
          "bearing": {
            "label": "Méthode du relèvement",
            "text": "Le cap est à l’ouest du nord de arcsin(3/5), environ 36,9°. Les relèvements se mesurent dans le sens horaire depuis le nord."
          }
        },
        "fields": {
          "heading": {
            "label": "Cap à suivre",
            "options": {}
          },
          "groundSpeed": {
            "label": "Vitesse fond vers le nord",
            "options": {}
          }
        }
      },
      "arrival": {
        "title": "Compléter le journal de traversée corrigé",
        "brief": "Utilisez la vitesse fond corrigée pour une étape de 8 NM vers le nord.",
        "goal": "Calculez la durée et conservez les hypothèses indiquées.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "leg": {
            "label": "Données de l’étape",
            "text": "Distance 8 NM. Vitesse fond corrigée 4 kn. Départ 10:00 UTC."
          },
          "limits": {
            "label": "Hypothèses",
            "text": "Courant constant, vitesse dans l’eau de 5 kn et aucune dérive de vent. Ces hypothèses doivent être vérifiées pendant un voyage réel."
          }
        },
        "fields": {
          "duration": {
            "label": "Durée de traversée",
            "options": {}
          },
          "arrival": {
            "label": "Arrivée : heures après 10:00",
            "options": {}
          },
          "monitor": {
            "label": "Surveiller en route",
            "options": {
              "progress": "Progression fond observée",
              "current": "Changements de courant et de vent",
              "never": "Ne jamais réviser le calcul"
            }
          }
        }
      }
    }
  },
  "decision-sail-40": {
    "title": "Gérer des prévisions changeantes",
    "brief": "Approuvez un plan initialement valable, reconnaissez une limite dépassée et révisez prudemment le plan.",
    "limitations": "Limites et prévisions sont fictives. Changer de route ici ne démontre pas la manœuvre réelle par gros temps.",
    "stages": {
      "initial": {
        "title": "Vérifier le plan de route initial",
        "brief": "Utilisez les limites de l’équipage et la fenêtre de voyage indiquée.",
        "goal": "Confirmez que toutes les conditions initiales restent acceptables.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "limits": {
            "label": "Limites de l’équipage et de la route",
            "text": "Dans cet exercice : rafales maximales 18 kn, visibilité minimale 3 NM et aucun passage exposé avec vent contre courant."
          },
          "forecast": {
            "label": "Prévisions initiales",
            "text": "Pendant tout le trajet et sa réserve : rafales 16 kn, visibilité 5 NM, vent et courant dans le même sens."
          }
        },
        "fields": {
          "met": {
            "label": "Conditions respectant les limites initiales",
            "options": {
              "gusts": "Limite de rafales",
              "visibility": "Limite de visibilité",
              "interaction": "Condition de vent et de courant"
            }
          },
          "status": {
            "label": "Statut initial du plan",
            "options": {
              "acceptable": "Dans les limites indiquées, sous réserve de vérifications continues",
              "forever": "Approuvé définitivement malgré les actualisations",
              "impossible": "Le calcul seul prouve la route impossible"
            }
          }
        }
      },
      "change": {
        "title": "Identifier les risques modifiés",
        "brief": "Un nouveau bulletin modifie les rafales et l’interaction vent/courant.",
        "goal": "Notez toutes les limites dépassées, pas seulement le vent moyen.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "new": {
            "label": "Prévisions actualisées",
            "text": "Les rafales montent à 23 kn. La visibilité reste 5 NM. Le vent souffle maintenant contre le courant sur l’étape exposée."
          },
          "sea": {
            "label": "Note d’exposition",
            "text": "Le vent contre le courant peut creuser la mer. Les restrictions précédentes restent en vigueur."
          }
        },
        "fields": {
          "breaches": {
            "label": "Indiquer les limites dépassées",
            "options": {
              "gusts": "Limite de rafales",
              "visibility": "Limite de visibilité",
              "interaction": "Condition de vent et de courant"
            }
          }
        }
      },
      "revise": {
        "title": "Valider une révision complète",
        "brief": "Un abri vérifié est accessible avant l’étape exposée et respecte les limites.",
        "goal": "Déroutez-vous tant que l’alternative reste viable et actualisez le plan.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "alternative": {
            "label": "Rapport sur l’abri",
            "text": "L’alternative évite la section exposée vent contre courant et respecte les limites pendant la nouvelle fenêtre de voyage."
          },
          "reef": {
            "label": "Note de réduction de voilure",
            "text": "Prendre des ris peut être adapté, mais ne rend pas à lui seul acceptables les limites dépassées de la route."
          }
        },
        "fields": {
          "route": {
            "label": "Route révisée",
            "options": {
              "shelter": "Utiliser l’alternative abritée vérifiée",
              "exposed": "Continuer sur la route exposée après réduction de voilure",
              "ignore": "Ignorer le bulletin"
            }
          },
          "record": {
            "label": "Achever la révision",
            "options": {
              "crew": "Expliquer à l’équipage la nouvelle route et l’approche",
              "eta": "Actualiser destination et arrivée estimée",
              "monitor": "Continuer à vérifier les conditions",
              "delete": "Supprimer les limites initiales"
            }
          }
        }
      }
    }
  },
  "decision-sail-41": {
    "title": "Maintenir l’évaluation d’un contact non visible",
    "brief": "Consignez les contacts par visibilité réduite, choisissez les règles adaptées et ne déclarez pas le risque résolu trop tôt.",
    "limitations": "Évalue l’interprétation et la planification de réponse, pas l’utilisation du radar ni les manœuvres physiques anticollision.",
    "stages": {
      "risk": {
        "title": "Tracer la tendance du contact",
        "brief": "L’autre navire est détecté électroniquement, mais n’est pas en vue.",
        "goal": "Consignez la tendance et maintenez l’évaluation du risque.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "observations": {
            "label": "Journal des contacts",
            "text": "Minute 0 : relèvement 070°, distance 0,8 NM. Minute 2 : relèvement 070°, distance 0,5 NM. Le navire n’est pas visible."
          },
          "uncertainty": {
            "label": "Limites d’observation",
            "text": "Une source électronique seule ne donne pas une image complète. En cas de doute, considérez le risque d’abordage comme présent."
          }
        },
        "fields": {
          "rangeChange": {
            "label": "Réduction de distance",
            "options": {}
          },
          "risk": {
            "label": "État du risque du contact",
            "options": {
              "present": "Risque d’abordage présent",
              "clear": "Passage sûr démontré",
              "sail": "Aucun risque si nous sommes à la voile"
            }
          }
        }
      },
      "framework": {
        "title": "Préparer la réponse par visibilité réduite",
        "brief": "Utilisez le cadre international indiqué pour des navires qui ne sont pas en vue l’un de l’autre.",
        "goal": "Maintenez une veille adaptée, une vitesse de sécurité et un usage correct des équipements et signaux.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "rule": {
            "label": "Cadre applicable",
            "text": "La règle internationale 19 concerne les navires qui ne sont pas en vue l’un de l’autre dans ou près d’une zone de visibilité réduite. Les obligations générales de veille, vitesse de sécurité et évaluation du risque demeurent."
          },
          "power": {
            "label": "État du navire",
            "text": "Dans ce cas, votre yacht marche au moteur ; les moteurs doivent être prêts à manœuvrer immédiatement."
          }
        },
        "fields": {
          "plan": {
            "label": "Valider les exigences de réponse",
            "options": {
              "lookout": "Maintenir la veille avec les moyens appropriés disponibles",
              "speed": "Adopter une vitesse de sécurité adaptée",
              "engines": "Garder les moteurs prêts à manœuvrer immédiatement",
              "signals": "Utiliser correctement les signaux et équipements requis",
              "priority": "Revendiquer une priorité automatique de voilier"
            }
          }
        }
      },
      "reassess": {
        "title": "Vérifier l’observation suivante",
        "brief": "Une nouvelle observation arrive après le lancement du plan.",
        "goal": "Maintenez le suivi du contact jusqu’à disposer de preuves d’un passage sûr.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "later": {
            "label": "Rapport ultérieur du contact",
            "text": "La distance est maintenant 0,3 NM et le relèvement reste 070°. Aucune distance de passage sûre n’est établie."
          },
          "action": {
            "label": "Limite d’action",
            "text": "La manœuvre exacte exige toutes les circonstances et règles applicables. Aucun virage universel n’est prescrit ici."
          }
        },
        "fields": {
          "status": {
            "label": "État actualisé du contact",
            "options": {
              "risk": "Le risque reste non résolu",
              "clear": "Sûr puisqu’un plan a été établi",
              "ignore": "Ignorer jusqu’au contact visuel"
            }
          },
          "follow": {
            "label": "Suivi nécessaire",
            "options": {
              "continue": "Poursuivre l’évaluation et les actions opportunes selon les règles",
              "finish": "Terminer la veille",
              "turn": "Tourner toujours du même côté dans toutes les rencontres"
            }
          }
        }
      }
    }
  },
  "decision-sail-42": {
    "title": "Recouper une approche nocturne",
    "brief": "Identifiez un feu par sa caractéristique complète, vérifiez l’indépendance des capteurs et interrompez l’approche si les observations indépendantes divergent.",
    "limitations": "Feux et géométrie sont fictifs. Évalue le recoupement d’informations, pas le pilotage nocturne réel ni la précision instrumentale.",
    "stages": {
      "identify": {
        "title": "Identifier le feu observé",
        "brief": "Utilisez la liste des feux de l’exercice, pas seulement la couleur.",
        "goal": "Associez la caractéristique observée à la bonne référence de carte.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "observation": {
            "label": "Feu observé",
            "text": "Un feu blanc émet un éclat toutes les 6 secondes."
          },
          "list": {
            "label": "Liste des feux d’entraînement",
            "text": "A : blanc, un éclat toutes les 3 secondes. B : blanc, un toutes les 6 secondes. C : vert, un toutes les 6 secondes."
          }
        },
        "fields": {
          "light": {
            "label": "Référence identifiée",
            "options": {
              "A": "Référence A",
              "B": "Référence B",
              "C": "Référence C"
            }
          },
          "features": {
            "label": "Utiliser les deux caractéristiques d’identification",
            "options": {
              "color": "Couleur",
              "period": "Rythme et période des éclats",
              "brightness": "Luminosité d’écran seule"
            }
          }
        }
      },
      "independent": {
        "title": "Choisir des recoupements indépendants",
        "brief": "Deux écrans électroniques concordent parce qu’ils partagent un capteur.",
        "goal": "Choisissez des observations pouvant apporter une vérification indépendante.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "sensors": {
            "label": "Connexions des capteurs",
            "text": "Les écrans 1 et 2 reçoivent la position du GPS G. Un alignement visuel et la tendance de profondeur sont observés séparément."
          },
          "corrections": {
            "label": "Interprétation de la profondeur",
            "text": "Interprétez la tendance avec la marée et le décalage de sonde connus ; elle ne fournit pas seule un point exact indépendant."
          }
        },
        "fields": {
          "sources": {
            "label": "Choisir des observations de recoupement indépendantes",
            "options": {
              "line": "Alignement visuel identifié",
              "depth": "Tendance de profondeur correctement interprétée",
              "duplicate": "Deuxième écran du récepteur GPS G"
            }
          },
          "screens": {
            "label": "Classer les positions des deux écrans",
            "options": {
              "shared": "Deux affichages d’une même source",
              "independent": "Deux points indépendants",
              "infallible": "Confirmation sans erreur"
            }
          }
        }
      },
      "disagree": {
        "title": "Résoudre une approche contradictoire",
        "brief": "Le traceur indique une route correcte, mais les observations indépendantes divergent avant une entrée étroite.",
        "goal": "Restez en eaux sûres vérifiées et résolvez l’écart avant de vous engager.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "conflict": {
            "label": "Observations contradictoires",
            "text": "L’alignement lumineux attendu n’apparaît pas. La profondeur est inférieure aux attentes après corrections connues. Les deux écrans GPS montrent la même route."
          },
          "room": {
            "label": "Option disponible",
            "text": "Des eaux sûres vérifiées et de l’espace restent disponibles hors de l’entrée. Une réévaluation sûre y est possible."
          }
        },
        "fields": {
          "decision": {
            "label": "Décision d’approche",
            "options": {
              "hold": "Réduire le risque en eaux sûres vérifiées et résoudre le désaccord",
              "enter": "Poursuivre dans l’entrée étroite pour enquêter",
              "hide": "Éteindre l’instrument divergent"
            }
          },
          "review": {
            "label": "Revérifier avant de poursuivre",
            "options": {
              "identity": "Identification et alignement des feux",
              "chart": "Référence, échelle et actualisations de carte",
              "depth": "Profondeur, marée et décalages instrumentaux",
              "ignore": "Ignorer les observations indépendantes"
            }
          }
        }
      }
    }
  },
  "decision-sail-54": {
    "title": "Lire la carte avant de partir",
    "brief": "Utilisez une carte météo simplifiée et un relevé barométrique pour évaluer le vent d’une courte navigation côtière.",
    "limitations": "La carte et les relevés sont des données d’exercice simplifiées, pas une prévision. Pour de vraies navigations, utilisez les bulletins météo marins officiels.",
    "stages": {
      "spacing": {
        "title": "Comparer les isobares",
        "brief": "La carte montre deux zones le long de votre route prévue.",
        "goal": "Identifier où le vent sera le plus fort.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "north": {
            "label": "Zone nord",
            "text": "Les isobares espacées de 4 hPa sont distantes d’environ 120 NM."
          },
          "south": {
            "label": "Zone sud",
            "text": "Les isobares espacées de 4 hPa sont distantes d’environ 30 NM."
          }
        },
        "fields": {
          "stronger": {
            "label": "Où le vent sera-t-il le plus fort ?",
            "options": {
              "south": "Dans la zone sud",
              "north": "Dans la zone nord",
              "same": "Pareil dans les deux"
            }
          }
        }
      },
      "direction": {
        "title": "Déterminer la direction du vent",
        "brief": "Une dépression est centrée à environ 150 NM à l’ouest de votre position, dans l’hémisphère nord.",
        "goal": "Choisir la direction du vent à votre position.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "low": {
            "label": "Carte",
            "text": "La dépression est centrée à votre ouest. Près de vous, ses isobares sont orientées à peu près nord-sud."
          },
          "rule": {
            "label": "Règle pratique",
            "text": "Dans l’hémisphère nord, le vent tourne autour d’une dépression dans le sens inverse des aiguilles d’une montre, légèrement dévié vers le centre."
          }
        },
        "fields": {
          "windFrom": {
            "label": "Le vent souffle du",
            "options": {
              "south": "Sud",
              "north": "Nord",
              "east": "Est",
              "west": "Ouest"
            }
          }
        }
      },
      "trend": {
        "title": "Agir selon le baromètre",
        "brief": "Avant de partir, vous consultez le relevé du baromètre.",
        "goal": "Décider s’il faut partir, et quoi noter.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "log": {
            "label": "Relevé du baromètre",
            "text": "06:00 1012 hPa ; 09:00 1008 hPa ; 12:00 1004 hPa."
          },
          "plan": {
            "label": "Plan de navigation",
            "text": "La navigation dure six heures le long d’une côte exposée, sans port à mi-chemin."
          }
        },
        "fields": {
          "decision": {
            "label": "Décision de départ",
            "options": {
              "wait": "Attendre : la pression baisse vite et le vent va forcir",
              "go": "Partir tout de suite, avant que ça empire",
              "ignore": "Partir : 1004 hPa reste une valeur normale"
            }
          },
          "record": {
            "label": "À noter dans le plan",
            "options": {
              "trend": "La baisse de 4 hPa en trois heures",
              "forecast": "Consulter le dernier bulletin météo marin",
              "stop": "Arrêter de relever le baromètre"
            }
          }
        }
      }
    }
  },
  "decision-sail-55": {
    "title": "Traverser le passage d’un front",
    "brief": "Reconnaissez les étapes d’une dépression frontale et préparez le bateau pour le front froid.",
    "limitations": "Un modèle frontal simplifié. Les vrais fronts varient en vitesse, en intensité et en horaire.",
    "stages": {
      "sequence": {
        "title": "Remettre le front dans l’ordre",
        "brief": "Une dépression frontale traverse votre zone d’ouest en est, dans l’hémisphère nord.",
        "goal": "Classer ce que vous allez rencontrer, du premier au dernier.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "chart": {
            "label": "Carte",
            "text": "La carte montre une dépression au nord-ouest, avec un front chaud devant elle et un front froid derrière."
          },
          "sky": {
            "label": "Ciel actuel",
            "text": "Des nuages hauts et fins s’étendent et s’épaississent lentement depuis l’ouest."
          }
        },
        "fields": {
          "order": {
            "label": "Ordre d’arrivée",
            "options": {
              "warmFront": "Front chaud",
              "warmSector": "Secteur chaud",
              "coldFront": "Front froid"
            }
          }
        }
      },
      "cold": {
        "title": "Se préparer au front froid",
        "brief": "Quelques heures plus tard, la pluie a faibli et la pression est stable. Puis le ciel change à l’ouest.",
        "goal": "Nommer ce qui arrive et préparer le bateau.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "west": {
            "label": "Ciel à l’ouest",
            "text": "De hauts cumulonimbus avec une ligne sombre de grains approchent."
          },
          "pressure": {
            "label": "Baromètre",
            "text": "Stable depuis trois heures."
          }
        },
        "fields": {
          "event": {
            "label": "Qu’est-ce qui approche ?",
            "options": {
              "coldFront": "Le front froid",
              "warmFront": "Un second front chaud",
              "high": "Un anticyclone"
            }
          },
          "prepare": {
            "label": "Préparer le bateau",
            "options": {
              "reef": "Prendre un ris avant l’arrivée du grain",
              "stow": "Ranger le matériel et fermer les panneaux",
              "metal": "Éloigner l’équipage du mât et des pièces métalliques",
              "hoist": "Envoyer plus de toile pour rentrer plus vite"
            }
          }
        }
      },
      "after": {
        "title": "Après le front",
        "brief": "La ligne de grains est passée sur vous.",
        "goal": "Choisir ce à quoi vous vous attendez ensuite.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "now": {
            "label": "Conditions actuelles",
            "text": "Le vent a tourné au nord-ouest et souffle en rafales ; la visibilité est très bonne ; la pression remonte."
          }
        },
        "fields": {
          "expect": {
            "label": "À quoi vous attendez-vous ensuite ?",
            "options": {
              "showers": "Un air plus frais et plus clair, avec des averses en rafales qui s’atténuent peu à peu",
              "drizzle": "Un calme immédiat et une bruine chaude",
              "fog": "Un brouillard épais pour le reste de la journée"
            }
          }
        }
      }
    }
  },
  "decision-sail-56": {
    "title": "Évaluer l’état de la mer",
    "brief": "Nommez la force du vent, organisez-vous autour d’une brise de mer et entrez dans un port par houle.",
    "limitations": "Les valeurs de vent et de vagues sont des données d’exercice. Les vraies entrées de port exigent une connaissance locale et les conditions du moment.",
    "stages": {
      "force": {
        "title": "Nommer la force Beaufort",
        "brief": "Comparez l’instrument avec la mer autour de vous.",
        "goal": "Noter la force Beaufort et la comparer à la limite de l’équipage.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "gauge": {
            "label": "Anémomètre",
            "text": "25 nœuds de vent réel, établis."
          },
          "sea": {
            "label": "Mer",
            "text": "Grosses vagues ; crêtes d’écume blanche partout et quelques embruns."
          },
          "limit": {
            "label": "Limite de l’équipage",
            "text": "Pour cet exercice, l’équipage a convenu de naviguer jusqu’à force 5."
          }
        },
        "fields": {
          "force": {
            "label": "Force Beaufort",
            "options": {}
          },
          "within": {
            "label": "Est-ce dans la limite de l’équipage ?",
            "options": {
              "no": "Non",
              "yes": "Oui"
            }
          }
        }
      },
      "breeze": {
        "title": "S’organiser autour de la brise de mer",
        "brief": "Une journée d’été chaude et ensoleillée, avec un vent faible le matin.",
        "goal": "Choisir le moment le plus calme pour une sortie à la journée.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "forecast": {
            "label": "Prévision",
            "text": "La brise de mer se lève en fin de matinée, atteint 15–18 nœuds l’après-midi et tombe après le coucher du soleil."
          }
        },
        "fields": {
          "when": {
            "label": "Quand les conditions seront-elles les plus calmes ?",
            "options": {
              "early": "Partir tôt et rentrer avant midi",
              "afternoon": "Partir à 14:00, au plus fort de la brise",
              "night": "La brise est la plus forte la nuit"
            }
          }
        }
      },
      "entrance": {
        "title": "Entrer par houle",
        "brief": "Vous arrivez au port dans l’après-midi.",
        "goal": "Choisir comment entrer en sécurité.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "swell": {
            "label": "Entrée du port",
            "text": "Une houle d’ouest de 2 m déferle par moments en travers de l’entrée."
          },
          "sets": {
            "label": "Rythme des vagues",
            "text": "Des séries de vagues plus grosses arrivent toutes les quelques minutes, séparées par des accalmies."
          }
        },
        "fields": {
          "entry": {
            "label": "Comment entrez-vous ?",
            "options": {
              "lull": "Attendre dehors, observer les séries et entrer pendant une accalmie avec assez de vitesse pour gouverner",
              "now": "Entrer tout de suite, très lentement",
              "anchor": "Mouiller dans l’entrée et attendre"
            }
          },
          "caught": {
            "label": "À mi-chemin de l’entrée, l’équipier qui surveille l’arrière annonce qu’une nouvelle série se forme derrière vous. Que faites-vous ?",
            "options": {
              "face": "Tourner l’étrave face à la série et tenir au moteur, puis continuer à entrer après elle",
              "run": "Ralentir et laisser les vagues vous porter à l’intérieur",
              "beam": "Se mettre en travers pour que les vagues passent sous le bateau"
            }
          },
          "prepare": {
            "label": "Avant d’entrer",
            "options": {
              "crew": "Gilets de sauvetage portés et équipage attaché",
              "hatches": "Panneaux fermés",
              "engine": "Moteur en marche et prêt",
              "aft": "Un équipier dans le cockpit qui surveille les vagues à l’arrière",
              "foredeck": "Envoyer un équipier sur la plage avant pour surveiller"
            }
          }
        }
      }
    }
  },
  "decision-sail-57": {
    "title": "Préparer une traversée en Méditerranée orientale",
    "brief": "Appliquez les régimes météo régionaux à une traversée, à un matin de Charkiya et à une étape estivale en mer Égée.",
    "limitations": "Les régimes régionaux sont généralisés. Utilisez toujours le bulletin météo marin officiel en vigueur pour la zone.",
    "stages": {
      "winter": {
        "title": "Préparer la traversée d’hiver",
        "brief": "Vous prévoyez de naviguer d’Israël à Chypre, environ 24 heures.",
        "goal": "Décider quand partir.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "forecast": {
            "label": "Prévision",
            "text": "Une dépression sur la Grèce se déplace vers l’est en direction de Chypre au cours des deux prochains jours."
          },
          "pattern": {
            "label": "Régime",
            "text": "Son front froid apportera un vent fort de sud-ouest à ouest et une mer forte sur la route."
          }
        },
        "fields": {
          "decision": {
            "label": "Décision de départ",
            "options": {
              "wait": "Attendre que la dépression et son front froid soient passés",
              "early": "Partir maintenant pour la devancer",
              "ignore": "Partir comme prévu"
            }
          }
        }
      },
      "sharqiya": {
        "title": "Lire un matin de Charkiya",
        "brief": "Un matin d’automne dans une marina du nord d’Israël.",
        "goal": "Interpréter l’eau calme et choisir un plan.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "wind": {
            "label": "Vent",
            "text": "Un vent d’est fort et sec souffle de la terre. Dans la marina et à proximité, la mer est plate."
          },
          "offshore": {
            "label": "Prévision au large",
            "text": "À dix milles au large : vent d’est force 6 et mer qui se forme."
          }
        },
        "fields": {
          "meaning": {
            "label": "Que vous dit l’eau plate près du rivage ?",
            "options": {
              "offshore": "Peu de chose : le vent souffle de la terre et les vagues se forment plus au large",
              "calm": "Toute la route sera calme",
              "onshore": "Le vent souffle vers la côte"
            }
          },
          "plan": {
            "label": "Votre plan",
            "options": {
              "stay": "Rester près de la côte, ou attendre que le vent d’est faiblisse",
              "out": "Aller à dix milles au large pour une navigation rapide",
              "night": "Partir de nuit en espérant que ça se calme"
            }
          }
        }
      },
      "aegean": {
        "title": "Préparer une étape estivale en mer Égée",
        "brief": "Une location en juillet dans les Cyclades.",
        "goal": "Préparer la prochaine étape en fonction de la prévision.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "forecast": {
            "label": "Prévision",
            "text": "Meltem de nord, force 6 à 7, pour les trois prochains jours."
          }
        },
        "fields": {
          "route": {
            "label": "Prochaine étape",
            "options": {
              "south": "Descendre vers le sud au portant, par courtes étapes abritées",
              "north": "Remonter au près vers le nord en pleine mer à midi",
              "ignore": "L’ignorer : il s’arrêtera le soir"
            }
          },
          "prepare": {
            "label": "Préparation",
            "options": {
              "reef": "Prendre un ris avant de quitter le port",
              "shelter": "Choisir des ports abrités du nord",
              "lee": "Mouiller au sud des îles, sous leur abri",
              "exposed": "Mouiller au nord des îles"
            }
          }
        }
      }
    }
  },
  "decision-sail-58": {
    "title": "Vérifier l’équipement de sécurité",
    "brief": "Inspectez l’équipement de sécurité avant une sortie côtière, choisissez le bon feu de détresse et combattez un incendie avec le bon extincteur.",
    "limitations": "Cet exercice évalue des choix à partir de rapports fournis. Il ne teste ni le matériel réel, ni le tir de feux de détresse, ni la lutte contre un vrai incendie.",
    "stages": {
      "inspect": {
        "title": "Inspecter l’équipement de sécurité",
        "brief": "Vous vérifiez l’équipement avant une sortie à la journée le long de la côte.",
        "goal": "Choisissez ce qui doit être réglé avant de partir.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "flares": {
            "label": "Boîte de feux de détresse",
            "text": "Deux fusées parachutes rouges sont périmées depuis l’an dernier ; les feux à main et le fumigène orange sont valides."
          },
          "fire": {
            "label": "Extincteurs",
            "text": "Le manomètre d’un extincteur à poudre est dans le rouge ; celui de l’autre est dans le vert."
          },
          "harness": {
            "label": "Harnais",
            "text": "Il y a un harnais pour chacun des quatre équipiers, et les lignes de vie sont en place."
          }
        },
        "fields": {
          "fix": {
            "label": "À régler avant de partir",
            "options": {
              "flares": "Remplacer les fusées parachutes périmées",
              "extinguisher": "Remplacer ou faire réviser l’extincteur dans le rouge",
              "harness": "Acheter d’autres harnais",
              "ignore": "Ne rien changer ; ce n’est qu’une sortie à la journée"
            }
          }
        }
      },
      "flare": {
        "title": "Choisir le bon feu de détresse",
        "brief": "Plus tard, le moteur est en panne et vous avez besoin d’aide.",
        "goal": "Associez chaque situation au bon signal.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "ship": {
            "label": "De nuit",
            "text": "Un navire se trouve à environ 6 NM et n’a pas répondu à la radio."
          },
          "helicopter": {
            "label": "De jour",
            "text": "Un hélicoptère de sauvetage vous cherche juste au-dessus de vous."
          }
        },
        "fields": {
          "night": {
            "label": "De nuit, navire à 6 NM",
            "options": {
              "rocket": "Fusée parachute rouge",
              "smoke": "Fumigène orange",
              "hand": "Rien pour l’instant ; attendre qu’il se rapproche"
            }
          },
          "day": {
            "label": "De jour, hélicoptère au-dessus",
            "options": {
              "smoke": "Fumigène orange, qui montre aussi le vent",
              "rocket": "Fusée parachute rouge tirée droit sur lui",
              "none": "Aucun signal ; il vous a déjà vu"
            }
          }
        }
      },
      "fire": {
        "title": "Combattre un feu moteur",
        "brief": "De la fumée sort du compartiment moteur.",
        "goal": "Choisissez l’extincteur et les actions.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "source": {
            "label": "Le feu",
            "text": "Du gazole brûle dans le compartiment moteur."
          }
        },
        "fields": {
          "agent": {
            "label": "Quel extincteur ?",
            "options": {
              "powder": "Poudre, ou mousse, par une petite ouverture",
              "water": "Un seau d’eau",
              "open": "Ouvrir grand le capot pour mieux voir d’abord"
            }
          },
          "actions": {
            "label": "À faire aussi",
            "options": {
              "engine": "Arrêter le moteur",
              "fuel": "Couper l’arrivée de carburant",
              "wind": "Orienter le bateau pour que la fumée s’éloigne de l’équipage",
              "hatches": "Ouvrir tous les panneaux pour aérer"
            }
          }
        }
      }
    }
  },
  "decision-sail-59": {
    "title": "Abandonner le navire",
    "brief": "Préparez l’abandon d’un voilier qui coule, redressez un radeau retourné et effectuez les premières actions à bord.",
    "limitations": "Cet exercice évalue uniquement des décisions à partir de rapports fournis. Entraînez-vous avec un vrai radeau de survie lors d’un stage de survie en mer.",
    "stages": {
      "prepare": {
        "title": "Préparer l’abandon",
        "brief": "L’eau monte plus vite que les pompes ne peuvent l’évacuer, et l’équipage ne trouve pas la voie d’eau.",
        "goal": "Mettez les actions dans l’ordre.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "status": {
            "label": "Situation",
            "text": "Le voilier coulera dans une vingtaine de minutes. Le temps est mauvais, mais la mer ne déferle pas."
          }
        },
        "fields": {
          "order": {
            "label": "Ordre des actions",
            "options": {
              "mayday": "Lancer un MAYDAY et une alerte de détresse ASN",
              "dress": "Enfiler gilets de sauvetage et vêtements chauds",
              "bag": "Prendre le sac de survie",
              "launch": "Attacher la bosse, mettre le radeau à l’eau et embarquer"
            }
          }
        }
      },
      "right": {
        "title": "Redresser le radeau",
        "brief": "Le radeau s’est gonflé à l’envers le long du bord.",
        "goal": "Choisissez comment le redresser.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "raft": {
            "label": "Le radeau",
            "text": "Il est toujours relié au voilier par sa bosse. La bouteille de gaz et la sangle de redressement sont sur son fond retourné."
          }
        },
        "fields": {
          "method": {
            "label": "Comment le redressez-vous ?",
            "options": {
              "strap": "Un nageur monte sur la bouteille de gaz, tient la sangle de redressement et se penche en arrière, du côté sous le vent",
              "deflate": "Le dégonfler et le regonfler",
              "abandon": "Le laisser et attendre un autre radeau"
            }
          }
        }
      },
      "aboard": {
        "title": "Premières actions dans le radeau",
        "brief": "Tout le monde est à bord du radeau.",
        "goal": "Choisissez les premières actions.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "now": {
            "label": "Maintenant",
            "text": "Le radeau est toujours relié au voilier qui coule. Les secours ont été demandés ; aucun navire n’est encore en vue."
          }
        },
        "fields": {
          "actions": {
            "label": "À faire maintenant",
            "options": {
              "cut": "Couper la bosse et s’éloigner du voilier",
              "anchor": "Mouiller l’ancre flottante pour rester près de la position signalée",
              "tablets": "Donner à chacun des comprimés contre le mal de mer",
              "flares": "Tirer tous les feux de détresse maintenant",
              "seawater": "Boire de l’eau de mer pour économiser l’eau douce"
            }
          }
        }
      }
    }
  },
  "decision-sail-60": {
    "title": "Gréez les bons cordages",
    "brief": "Choisissez les cordages selon leur usage, entretenez-les et calculez le gain d’un palan.",
    "limitations": "Cet exercice évalue des choix à partir des informations fournies. Les diamètres et efforts réels dépendent du bateau ; vérifiez-les auprès du fabricant de cordages et d’un moniteur.",
    "stages": {
      "choose": {
        "title": "Choisissez le cordage",
        "brief": "Vous remplacez trois cordages avant la saison.",
        "goal": "Choisissez la meilleure fibre pour chaque usage.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "jobs": {
            "label": "Les trois usages",
            "text": "Une ligne de mouillage et d’amarrage qui doit amortir les à-coups ; une drisse de grand-voile qui doit garder la forme de la voile ; une ligne de sauvetage à lancer qui doit flotter."
          }
        },
        "fields": {
          "anchor": {
            "label": "Ligne de mouillage et d’amarrage",
            "options": {
              "nylon": "Nylon",
              "polyester": "Polyester",
              "polypropylene": "Polypropylène"
            }
          },
          "halyard": {
            "label": "Drisse de grand-voile",
            "options": {
              "polyester": "Polyester",
              "nylon": "Nylon",
              "polypropylene": "Polypropylène"
            }
          },
          "rescue": {
            "label": "Ligne de sauvetage à lancer",
            "options": {
              "polypropylene": "Polypropylène",
              "nylon": "Nylon",
              "polyester": "Polyester"
            }
          }
        }
      },
      "care": {
        "title": "Entretenez les cordages",
        "brief": "Après une semaine de croisière, vous inspectez les cordages.",
        "goal": "Choisissez quoi faire.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "salt": {
            "label": "État",
            "text": "Les cordages sont couverts de croûtes de sel. L’amarre avant est ragée là où elle passe dans le chaumard."
          },
          "spare": {
            "label": "Cordages de rechange",
            "text": "Vous avez une amarre neuve du bon diamètre, et deux vieux cordages plus fins."
          }
        },
        "fields": {
          "actions": {
            "label": "À faire",
            "options": {
              "rinse": "Rincer les cordages à l’eau douce, les sécher et les ranger à l’ombre",
              "replace": "Remplacer l’amarre ragée et la protéger au chaumard",
              "double": "Nouer les deux vieux cordages plus fins à la place de l’amarre ragée",
              "sun": "Laisser les cordages cuire au soleil pour sécher le sel"
            }
          }
        }
      },
      "tackle": {
        "title": "Calculez le palan",
        "brief": "Vous hissez l’annexe de 320 kg avec un palan suspendu au bout de la bôme.",
        "goal": "Calculez la traction et le gain, sans compter le frottement.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "rig": {
            "label": "Le palan",
            "text": "Quatre brins de cordage portent la poulie mobile accrochée à l’annexe."
          },
          "main": {
            "label": "L’écoute de grand-voile",
            "text": "L’écoute de grand-voile a deux poulies doubles, et le cordage part de la poulie de bôme, qui est mobile."
          }
        },
        "fields": {
          "pull": {
            "label": "Traction nécessaire pour hisser l’annexe",
            "options": {}
          },
          "gain": {
            "label": "Gain du palan d’écoute de grand-voile",
            "options": {}
          }
        }
      }
    }
  },
  "decision-sail-61": {
    "title": "Arriver dans un port étranger",
    "brief": "Lisez les pavillons du code autour de vous, hissez les bons pavillons à l’arrivée et accomplissez correctement les formalités d’entrée.",
    "limitations": "La signification des pavillons suit le Code international des signaux. Les règles d’entrée varient selon les pays et évoluent ; vérifiez-les avant chaque voyage.",
    "stages": {
      "read": {
        "title": "Lire les pavillons autour de vous",
        "brief": "En approchant d’un port étranger, vous voyez trois navires arborant chacun un pavillon du code isolé.",
        "goal": "Choisissez la bonne réaction pour chacun.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "a": {
            "label": "Premier navire",
            "text": "Un petit bateau arborant le pavillon A, blanc et bleu à extrémité en queue d’aronde."
          },
          "b": {
            "label": "Deuxième navire",
            "text": "Un pétrolier près de l’entrée arborant le pavillon B, rouge et en queue d’aronde."
          },
          "o": {
            "label": "Troisième navire",
            "text": "Un voilier arborant le pavillon O, moitié rouge et moitié jaune."
          }
        },
        "fields": {
          "flagA": {
            "label": "Navire au pavillon A",
            "options": {
              "clear": "Rester bien à l’écart à vitesse réduite : des plongeurs sont en immersion",
              "help": "Venir à couple pour aider",
              "ignore": "Aucune action nécessaire"
            }
          },
          "flagB": {
            "label": "Navire au pavillon B",
            "options": {
              "cargo": "Marchandises dangereuses : vous pouvez passer, mais restez bien à l’écart",
              "divers": "Plongeurs en immersion",
              "stop": "S’arrêter et attendre à l’extérieur du port"
            }
          },
          "flagO": {
            "label": "Navire au pavillon O",
            "options": {
              "mob": "Homme à la mer : veiller et proposer son aide",
              "fuel": "Il fait le plein de carburant",
              "healthy": "Il est indemne et demande à entrer au port"
            }
          }
        }
      },
      "hoist": {
        "title": "Hisser les pavillons d’arrivée",
        "brief": "Vous entrez pour la première fois dans les eaux de ce pays.",
        "goal": "Choisissez l’emplacement de chaque pavillon.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "aboard": {
            "label": "Pavillons à bord",
            "text": "Votre propre pavillon national, le pavillon du pays hôte et un pavillon jaune Q."
          }
        },
        "fields": {
          "flags": {
            "label": "Hisser",
            "options": {
              "courtesy": "Pavillon du pays hôte sous la barre de flèche tribord",
              "q": "Pavillon Q sous la barre de flèche bâbord jusqu’à l’autorisation",
              "ensign": "Votre propre pavillon national à l’arrière",
              "replace": "Pavillon du pays hôte à l’arrière à la place de votre pavillon national"
            }
          }
        }
      },
      "clear": {
        "title": "Faire les formalités et poursuivre",
        "brief": "La douane et l’immigration vous ont autorisé au port d’entrée officiel. Vous prévoyez de longer la côte.",
        "goal": "Choisissez les documents et les pavillons pour la croisière.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "papers": {
            "label": "Documents d’entrée",
            "text": "Ce pays délivre aux yachts en visite un transit log au port d’entrée."
          }
        },
        "fields": {
          "log": {
            "label": "Que permet le transit log ?",
            "options": {
              "free": "Circuler librement dans les eaux côtières du pays",
              "fishing": "La pêche commerciale",
              "nothing": "Rien ; ce n’est qu’un souvenir"
            }
          },
          "after": {
            "label": "Après les formalités d’entrée",
            "options": {
              "lowerQ": "Amener le pavillon Q",
              "courtesy": "Garder le pavillon de courtoisie dans ces eaux",
              "ensign": "Amener votre propre pavillon national"
            }
          }
        }
      }
    }
  },
  "decision-sail-62": {
    "title": "Faire face aux avaries de matériel",
    "brief": "Gérez une avarie de barre, un hauban cassé et un remorquage, à partir des rapports fournis.",
    "limitations": "Cet exercice évalue des choix à partir des rapports fournis. Entraînez-vous à monter la barre franche de secours et à gréer un remorquage avec un moniteur.",
    "stages": {
      "steering": {
        "title": "Perdre la barre",
        "brief": "En entrant au moteur dans une marina, la roue tourne soudain dans le vide et le bateau ne répond plus.",
        "goal": "Choisissez quoi faire.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "check": {
            "label": "Vérification",
            "text": "Le câble de direction a cassé. Le safran lui-même est intact. La digue est à 150 m devant."
          }
        },
        "fields": {
          "fix": {
            "label": "Votre action",
            "options": {
              "tiller": "Monter la barre franche de secours sur la mèche du safran",
              "engine": "Gouverner au moteur seul et continuer d’entrer",
              "anchor": "Mouiller l’ancre dans l’entrée"
            }
          },
          "also": {
            "label": "Également",
            "options": {
              "slow": "Ralentir et rester à l’écart de la digue",
              "call": "Prévenir la marina et appeler à l’aide tôt",
              "speed": "Accélérer pour entrer avant que la situation n’empire"
            }
          }
        }
      },
      "shroud": {
        "title": "Un hauban casse",
        "brief": "Vous naviguez au cap 150° par un vent de sud-ouest force 5.",
        "goal": "Déterminez quel hauban est en charge et agissez.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "wind": {
            "label": "Vent et amure",
            "text": "Le vent vient du sud-ouest, donc il arrive par votre côté tribord : vous êtes tribord amures."
          },
          "break": {
            "label": "Avarie",
            "text": "Un hauban sous charge vient de casser avec un claquement."
          }
        },
        "fields": {
          "side": {
            "label": "Quel hauban portait la charge ?",
            "options": {
              "starboard": "Le hauban tribord",
              "port": "Le hauban bâbord",
              "backstay": "Le pataras"
            }
          },
          "act": {
            "label": "Première action",
            "options": {
              "tack": "Virer de bord immédiatement pour que le côté cassé passe sous le vent",
              "hold": "Garder le cap et reprendre le pataras",
              "later": "Continuer à naviguer et affaler plus tard"
            }
          }
        }
      },
      "tow": {
        "title": "Prendre un bateau en remorque",
        "brief": "Un voilier de 10 m en panne de moteur demande un remorquage. La mer est d’environ 2 m.",
        "goal": "Choisissez la remorque et les préparatifs.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "lines": {
            "label": "Cordages à bord",
            "text": "Une amarre en nylon épais de 50 m, une écoute en polyester de 10 m et 10 m de chaîne."
          },
          "boats": {
            "label": "Bateaux",
            "text": "Les deux bateaux ont de solides taquets à l’avant et à l’arrière."
          }
        },
        "fields": {
          "line": {
            "label": "Remorque",
            "options": {
              "long": "L’amarre en nylon épais de 50 m",
              "short": "L’écoute en polyester de 10 m",
              "chain": "Les 10 m de chaîne"
            }
          },
          "prepare": {
            "label": "Préparer",
            "options": {
              "fuel": "Vérifier que vous avez assez de carburant pour la charge supplémentaire",
              "points": "Utiliser des points solides ou une patte d’oie sur les deux bateaux",
              "signals": "Convenir de signaux avec l’autre équipage",
              "fast": "Remorquer à pleine vitesse pour arriver vite"
            }
          }
        }
      }
    }
  },
  "decision-sail-63": {
    "title": "Placez des positions sur la carte",
    "brief": "Notez des positions, mesurez sur la bonne échelle et lisez les symboles de la carte pour préparer une navigation.",
    "limitations": "Cet exercice évalue la lecture de carte à partir des informations fournies. Entraînez-vous sur une vraie carte avec un compas à pointes sèches et une règle Cras.",
    "stages": {
      "grid": {
        "title": "Notez la position",
        "brief": "Vous lisez votre position sur la carte pour l’annoncer à la radio.",
        "goal": "Choisissez la bonne façon de l’écrire et de mesurer.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "chart": {
            "label": "Sur la carte",
            "text": "Le bateau est par 32 degrés 05 minutes nord et 34 degrés 46 minutes est. La carte est une carte Mercator."
          }
        },
        "fields": {
          "write": {
            "label": "Comment l’écrivez-vous ?",
            "options": {
              "latlon": "32°05′ N, 034°46′ E",
              "lonlat": "034°46′ N, 32°05′ E",
              "degrees": "32° N, 34° E"
            }
          },
          "scale": {
            "label": "Où mesurez-vous les distances ?",
            "options": {
              "lat": "Sur l’échelle des latitudes, sur le bord, à hauteur du bateau",
              "lon": "Sur l’échelle des longitudes, en haut",
              "any": "Sur n’importe quelle échelle de la carte"
            }
          }
        }
      },
      "from": {
        "title": "Position par rapport à un phare",
        "brief": "Le phare est votre repère.",
        "goal": "Choisissez où se trouve le bateau.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "report": {
            "label": "Annonce",
            "text": "« Le bateau est au 180° du phare, à 3 NM. »"
          }
        },
        "fields": {
          "where": {
            "label": "Où est le bateau ?",
            "options": {
              "south": "À 3 NM au sud du phare",
              "north": "À 3 NM au nord du phare",
              "west": "À 3 NM à l’ouest du phare"
            }
          }
        }
      },
      "symbols": {
        "title": "Lisez la carte",
        "brief": "Vous prévoyez de mouiller et de passer un feu en chemin.",
        "goal": "Lisez les symboles.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "light": {
            "label": "Feu",
            "text": "La carte indique « Fl(2) 6s 12m 9M »."
          },
          "bottom": {
            "label": "Fond",
            "text": "Le mouillage est marqué « S » et les roches voisines « R »."
          }
        },
        "fields": {
          "range": {
            "label": "Portée nominale du feu",
            "options": {}
          },
          "anchor": {
            "label": "Où mouillez-vous ?",
            "options": {
              "sand": "Sur le sable (S)",
              "rock": "Sur la roche (R)",
              "either": "N’importe où ; la nature du fond n’a pas d’importance"
            }
          },
          "update": {
            "label": "Comment savez-vous que la carte est à jour ?",
            "options": {
              "notices": "Comparer les corrections avec les derniers avis aux navigateurs",
              "date": "La date d’impression suffit",
              "never": "Les cartes ne changent jamais"
            }
          }
        }
      }
    }
  },
  "decision-sail-64": {
    "title": "Convertissez les caps du compas",
    "brief": "Passez des caps et relèvements compas aux valeurs magnétiques et vraies, et vérifiez le compas sur un alignement.",
    "limitations": "Cet exercice évalue seulement le calcul au compas. La vraie déviation doit être mesurée sur votre propre bateau.",
    "stages": {
      "variation": {
        "title": "Mettez à jour la déclinaison",
        "brief": "La rose de la carte indique « 3°30′ E 2015 (8′ E) ». Nous sommes en 2025.",
        "goal": "Calculez la déclinaison de cette année.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "rose": {
            "label": "Rose de la carte",
            "text": "Déclinaison 3°30′ E en 2015, qui augmente de 8′ E par an."
          }
        },
        "fields": {
          "var": {
            "label": "Déclinaison de cette année, arrondie au degré Est le plus proche",
            "options": {}
          }
        }
      },
      "course": {
        "title": "Du cap vrai au cap compas",
        "brief": "Vous devez faire une route de 213° T. La déclinaison est de 5° E. La courbe de déviation donne 2° W à ce cap.",
        "goal": "Calculez le cap compas.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "card": {
            "label": "Courbe de déviation",
            "text": "Aux caps proches de 210°, la déviation est de 2° W."
          }
        },
        "fields": {
          "magnetic": {
            "label": "Cap magnétique",
            "options": {}
          },
          "compass": {
            "label": "Cap compas à barrer",
            "options": {}
          }
        }
      },
      "transit": {
        "title": "Vérifiez sur un alignement",
        "brief": "Vous croisez un alignement porté sur la carte au 076° T. La déclinaison est de 5° E.",
        "goal": "Calculez la déviation.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "reading": {
            "label": "Compas",
            "text": "Quand les deux marques s’alignent, le compas de route indique 074°."
          }
        },
        "fields": {
          "dev": {
            "label": "Déviation à ce cap",
            "options": {
              "3w": "3° W",
              "3e": "3° E",
              "2e": "2° E"
            }
          }
        }
      }
    }
  },
  "decision-sail-65": {
    "title": "Faites le point",
    "brief": "Choisissez des objets pour un bon point, prenez les relèvements dans le bon ordre et décidez quoi faire d’un chapeau.",
    "limitations": "Cet exercice évalue des choix de tracé à partir des observations fournies. Entraînez-vous à prendre de vrais relèvements avec un compas de relèvement.",
    "stages": {
      "choose": {
        "title": "Choisissez les objets",
        "brief": "Quatre objets portés sur la carte sont en vue.",
        "goal": "Choisissez les trois meilleurs pour un point.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "objects": {
            "label": "Objets",
            "text": "Un phare devant, un clocher par le travers, un mât radio à seulement 10° du phare, et un cap derrière."
          }
        },
        "fields": {
          "pick": {
            "label": "Utiliser",
            "options": {
              "light": "Le phare devant",
              "church": "Le clocher par le travers",
              "headland": "Le cap derrière",
              "mast": "Le mât radio à 10° du phare"
            }
          }
        }
      },
      "order": {
        "title": "Prenez les relèvements",
        "brief": "Vous prenez les trois relèvements l’un après l’autre.",
        "goal": "Choisissez celui à prendre en dernier.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "speed": {
            "label": "Bateau",
            "text": "Vous faites 6 nœuds à cap constant."
          }
        },
        "fields": {
          "last": {
            "label": "Quel relèvement en dernier ?",
            "options": {
              "abeam": "Le clocher par le travers",
              "ahead": "Le phare devant",
              "astern": "Le cap derrière"
            }
          }
        }
      },
      "hat": {
        "title": "Tracez le point",
        "brief": "Les trois lignes forment un petit triangle. Un récif se trouve à l’est.",
        "goal": "Choisissez votre position et la vérification suivante.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "triangle": {
            "label": "Chapeau",
            "text": "Le triangle mesure 0,2 NM ; son coin est est le plus proche du récif."
          }
        },
        "fields": {
          "use": {
            "label": "Position à retenir",
            "options": {
              "danger": "Le coin le plus proche du récif",
              "centre": "Le centre",
              "far": "Le coin le plus éloigné du récif"
            }
          },
          "next": {
            "label": "Ensuite",
            "options": {
              "log": "Noter l’heure, la lecture du loch et le point dans le livre de bord",
              "gps": "Le comparer avec le GPS",
              "ignore": "Arrêter de vérifier ; le point est exact"
            }
          }
        }
      }
    }
  },
  "decision-sail-66": {
    "title": "Doublez le cap",
    "brief": "Calculez où un feu apparaîtra, prévoyez une distance de passage et vérifiez-la par l’angle sur l’avant.",
    "limitations": "Cet exercice évalue la préparation d’une navigation avec des chiffres fournis. La visibilité réelle, la réfraction et le courant changent les réponses.",
    "stages": {
      "rise": {
        "title": "Quand le feu apparaîtra-t-il ?",
        "brief": "Vous approchez de la côte de nuit.",
        "goal": "Calculez les distances.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "light": {
            "label": "Feu",
            "text": "Le phare fait 49 m de haut, avec une portée nominale de 20M."
          },
          "eye": {
            "label": "Vous",
            "text": "Votre œil est à 2,5 m au-dessus de l’eau."
          }
        },
        "fields": {
          "geo": {
            "label": "Distance à laquelle le feu peut apparaître au-dessus de l’horizon (2,08 × (√49 + √2,5))",
            "options": {}
          }
        }
      },
      "clear": {
        "title": "Préparez le relèvement de sécurité",
        "brief": "Un récif s’avance depuis le cap. Vous voulez rester à l’écart.",
        "goal": "Choisissez comment rester à l’écart.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "line": {
            "label": "Carte",
            "text": "La ligne qui part du phare et passe par le bord extérieur du récif est au 040° T. Les eaux saines sont là où le relèvement est supérieur à 040°."
          }
        },
        "fields": {
          "rule": {
            "label": "Qu’écrivez-vous sur la carte ?",
            "options": {
              "nlt": "Pas moins de 040°",
              "nmt": "Pas plus de 040°",
              "exact": "Exactement 040°"
            }
          },
          "reading": {
            "label": "Le phare relève maintenant au 036° T. Que faites-vous ?",
            "options": {
              "away": "S’écarter du récif jusqu’à ce que le relèvement dépasse 040°",
              "hold": "Garder le cap",
              "closer": "Venir vers le récif"
            }
          }
        }
      },
      "double": {
        "title": "Vérifiez la distance",
        "brief": "Vous naviguez à 5 nœuds à cap constant.",
        "goal": "Calculez votre distance au phare.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "angles": {
            "label": "Angles",
            "text": "Le phare est à 45° sur l’avant à 21:00 et par le travers (90°) à 21:36."
          }
        },
        "fields": {
          "off": {
            "label": "Distance au phare quand il est par le travers",
            "options": {}
          }
        }
      }
    }
  },
  "decision-sail-67": {
    "title": "Tenez compte du courant et de la dérive",
    "brief": "Résolvez le triangle du cap à suivre, corrigez la dérive et calculez la durée de la traversée.",
    "limitations": "Cet exercice évalue un tracé de vecteurs avec un courant constant et fourni. Les vrais courants changent selon l’heure et le lieu.",
    "stages": {
      "triangle": {
        "title": "Tracez le triangle",
        "brief": "Vous voulez faire une route de 000° T vers un port situé 12 NM au nord.",
        "goal": "Calculez le cap à suivre.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "current": {
            "label": "Courant",
            "text": "Le courant porte au 090° à 2 nœuds."
          },
          "boat": {
            "label": "Bateau",
            "text": "Vous faites 5 nœuds surface."
          }
        },
        "fields": {
          "steer": {
            "label": "Cap à suivre (vrai)",
            "options": {}
          },
          "sog": {
            "label": "Vitesse fond",
            "options": {}
          }
        }
      },
      "leeway": {
        "title": "Corrigez la dérive",
        "brief": "Le vent vient de l’ouest et vous estimez la dérive à 4°.",
        "goal": "Choisissez le cap corrigé.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "wind": {
            "label": "Vent",
            "text": "Vent d’ouest ; le bateau glisse vers l’est."
          }
        },
        "fields": {
          "final": {
            "label": "Cap à suivre après la dérive (vrai)",
            "options": {}
          }
        }
      },
      "time": {
        "title": "Calculez la durée",
        "brief": "Vous partez à 10:00.",
        "goal": "Calculez la durée de la traversée.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "leg": {
            "label": "Étape",
            "text": "12 NM à la vitesse fond que vous avez trouvée."
          }
        },
        "fields": {
          "hours": {
            "label": "Durée de la traversée",
            "options": {}
          },
          "check": {
            "label": "En chemin",
            "options": {
              "fix": "Faire régulièrement le point et corriger le cap",
              "trust": "Faire confiance au triangle sans vérifier",
              "straight": "Barrer droit sur le port"
            }
          }
        }
      }
    }
  },
  "decision-sail-68": {
    "title": "Préparez avec l’heure et la marée",
    "brief": "Convertissez les heures des prévisions, choisissez une fenêtre de marée et estimez la hauteur d’eau avec la règle des douzièmes.",
    "limitations": "Cet exercice évalue des calculs d’heure et de marée avec des annuaires fictifs. Utilisez les annuaires officiels et gardez une marge de sécurité.",
    "stages": {
      "time": {
        "title": "Convertissez la prévision",
        "brief": "La prévision marine annonce une bascule du vent à 12:00 UTC. C’est l’été en Israël.",
        "goal": "Convertissez l’heure.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "zone": {
            "label": "Fuseau horaire",
            "text": "L’heure d’été israélienne est UTC+3."
          }
        },
        "fields": {
          "local": {
            "label": "Heure locale de la bascule du vent",
            "options": {}
          }
        }
      },
      "height": {
        "title": "Hauteur de la marée",
        "brief": "Vous devez franchir un banc dans le golfe d’Eilat.",
        "goal": "Estimez la hauteur de la marée.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "table": {
            "label": "Annuaire des marées",
            "text": "Basse mer 0,3 m à 08:00, pleine mer 1,5 m à 14:00."
          }
        },
        "fields": {
          "h10": {
            "label": "Hauteur de marée à 10:00",
            "options": {}
          },
          "h11": {
            "label": "Hauteur de marée à 11:00",
            "options": {}
          }
        }
      },
      "depth": {
        "title": "Profondeur sur le banc",
        "brief": "Le banc est porté sur la carte avec une hauteur qui découvre de 0,2 m (chiffre souligné).",
        "goal": "Calculez la profondeur.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "crossing": {
            "label": "Plan",
            "text": "Vous prévoyez de passer à 11:00. Votre tirant d’eau est de 1,8 m."
          }
        },
        "fields": {
          "depth": {
            "label": "Profondeur sur le banc à 11:00",
            "options": {}
          },
          "go": {
            "label": "Pouvez-vous passer ?",
            "options": {
              "no": "Non ; la profondeur est inférieure au tirant d’eau",
              "yes": "Oui ; la marée monte"
            }
          }
        }
      }
    }
  },
  "decision-sail-69": {
    "title": "Choisissez les voiles",
    "brief": "Choisissez la voilure selon la prévision et corrigez la barre ardente en équilibrant les voiles.",
    "limitations": "Cet exercice évalue le choix des voiles à partir des rapports fournis. Entraînez-vous au port à établir les voiles de tempête avec un moniteur.",
    "stages": {
      "light": {
        "title": "Un matin de petit temps",
        "brief": "La prévision annonce 6 à 8 nœuds d’ouest, et vous naviguez au portant.",
        "goal": "Choisissez la voilure.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "crew": {
            "label": "Équipage",
            "text": "Deux équipiers expérimentés et vous."
          }
        },
        "fields": {
          "plan": {
            "label": "Voilure",
            "options": {
              "gennaker": "Grand-voile haute et gennaker",
              "storm": "Tourmentin et voile de cape",
              "reefed": "Deux ris et le foc"
            }
          }
        }
      },
      "helm": {
        "title": "Barre lourde",
        "brief": "À midi, le vent souffle à 20 nœuds au bon plein. Le bateau gîte beaucoup et la barre tire fort vers le vent.",
        "goal": "Choisissez quoi faire.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "feel": {
            "label": "À la barre",
            "text": "Le safran est très braqué rien que pour tenir le cap."
          }
        },
        "fields": {
          "fix": {
            "label": "À faire",
            "options": {
              "reef": "Prendre un ris dans la grand-voile",
              "traveler": "Descendre le chariot sous le vent",
              "genoa": "Rouler une partie du génois pour garder l’équilibre avec la grand-voile arisée",
              "harder": "Border davantage l’écoute de grand-voile"
            }
          }
        }
      },
      "storm": {
        "title": "Avis de coup de vent",
        "brief": "Un coup de vent est annoncé pour la nuit et vous ne pouvez pas atteindre d’abri.",
        "goal": "Choisissez la voilure de tempête.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "aboard": {
            "label": "Voiles à bord",
            "text": "Grand-voile à trois ris, génois sur enrouleur, tourmentin, voile de cape."
          }
        },
        "fields": {
          "plan": {
            "label": "Voilure pour le coup de vent",
            "options": {
              "storm": "Tourmentin et voile de cape",
              "genoa": "Un tiers du génois déroulé et grand-voile haute",
              "none": "Aucune voile, travers aux vagues"
            }
          }
        }
      }
    }
  },
  "decision-sail-70": {
    "title": "Gardez le bateau stable",
    "brief": "Rangez la charge, traitez l’eau libre à bord et jugez quand le bateau est devenu mou.",
    "limitations": "Cet exercice évalue seulement le raisonnement sur la stabilité. Les données de stabilité et les limites de charge de votre bateau figurent dans ses papiers.",
    "stages": {
      "stow": {
        "title": "Rangez la charge",
        "brief": "Vous chargez le bateau pour une semaine de croisière.",
        "goal": "Choisissez où mettre chaque chose.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "load": {
            "label": "Charge",
            "text": "Une ancre et une chaîne de rechange, 100 litres d’eau en bidons, une annexe gonflée avec son moteur hors-bord."
          }
        },
        "fields": {
          "stow": {
            "label": "À faire",
            "options": {
              "low": "Ranger l’ancre, la chaîne et l’eau en bas et près du milieu",
              "dinghy": "Remorquer ou dégonfler l’annexe plutôt que de la porter gonflée sur la plage avant",
              "deck": "Saisir les bidons d’eau sur le rouf"
            }
          }
        }
      },
      "free": {
        "title": "De l’eau à l’intérieur",
        "brief": "Par mer agitée, le bateau paraît soudain mou et roule lentement.",
        "goal": "Choisissez quoi faire.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "bilge": {
            "label": "Fonds",
            "text": "Vous trouvez 20 cm d’eau qui clapote dans les fonds, et le réservoir de carburant est à moitié plein."
          }
        },
        "fields": {
          "act": {
            "label": "À faire",
            "options": {
              "pump": "Pomper les fonds et trouver par où l’eau entre",
              "close": "Fermer les panneaux et les panneaux de descente",
              "ignore": "L’ignorer ; un peu d’eau n’a pas d’importance"
            }
          }
        }
      },
      "limit": {
        "title": "Jusqu’où peut-il gîter ?",
        "brief": "L’équipage demande si le voilier peut chavirer.",
        "goal": "Choisissez la bonne réponse.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "boat": {
            "label": "Bateau",
            "text": "Un monocoque à quille profonde."
          }
        },
        "fields": {
          "answer": {
            "label": "Qu’est-ce qui est vrai ?",
            "options": {
              "lever": "Le bras de levier de redressement augmente avec la gîte, puis retombe à zéro à un grand angle ; au-delà, le bateau chavire",
              "never": "Un quillard ne peut jamais chavirer",
              "cat": "Il est aussi stable qu’un catamaran à tous les angles"
            }
          }
        }
      }
    }
  },
  "decision-sail-71": {
    "title": "Tenez dans un coup de vent",
    "brief": "Préparez le bateau et l’équipage au gros temps, mettez-vous à la cape et choisissez une tactique de tempête.",
    "limitations": "Cet exercice évalue des décisions de gros temps à partir des rapports fournis. Entraînez-vous à la cape avec un moniteur par vent modéré.",
    "stages": {
      "prepare": {
        "title": "Avant que le vent forcisse",
        "brief": "Un coup de vent est annoncé dans six heures et le port sûr le plus proche est trop loin.",
        "goal": "Choisissez les préparatifs.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "now": {
            "label": "Maintenant",
            "text": "Vent de 15 nœuds qui forcit ; l’équipage est reposé."
          }
        },
        "fields": {
          "do": {
            "label": "À faire maintenant",
            "options": {
              "stow": "Ranger et saisir tout à l’intérieur et sur le pont",
              "jacklines": "Installer les lignes de vie et faire mettre un harnais à chacun",
              "food": "Cuisiner un repas chaud et remplir des thermos",
              "reef": "Prendre un ris tôt et préparer le tourmentin",
              "wait": "Attendre que le vent soit fort avant de faire quoi que ce soit"
            }
          }
        }
      },
      "heave": {
        "title": "Mettez-vous à la cape",
        "brief": "Vous devez faire reposer l’équipage et prendre le troisième ris.",
        "goal": "Choisissez comment arrêter le bateau.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "sails": {
            "label": "Voiles",
            "text": "La grand-voile arisée et le tourmentin sont établis."
          }
        },
        "fields": {
          "how": {
            "label": "Comment vous mettez-vous à la cape ?",
            "options": {
              "back": "Virer en laissant le foc à contre, choquer la grand-voile et amarrer la barre pour faire remonter l’étrave au vent",
              "drop": "Affaler toutes les voiles",
              "run": "Abattre et fuir vite"
            }
          }
        }
      },
      "tactic": {
        "title": "Mer déferlante",
        "brief": "Les vagues déferlent maintenant et le bateau surfe dangereusement au portant.",
        "goal": "Choisissez la tactique.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "room": {
            "label": "Eau à courir",
            "text": "Vous avez 40 NM d’eau libre sous le vent."
          }
        },
        "fields": {
          "tactic": {
            "label": "Tactique",
            "options": {
              "drogue": "Fuir à sec de toile ou sous tourmentin en remorquant un traînard à l’arrière",
              "beam": "Affaler toutes les voiles et rester travers à la mer",
              "fast": "Fuir vite avec toute la toile"
            }
          }
        }
      }
    }
  },
  "decision-sail-72": {
    "title": "Assurez le quart de nuit",
    "brief": "Transmettez un quart, décidez quand appeler le chef de bord et organisez la veille au mouillage.",
    "limitations": "Cet exercice évalue des décisions de quart à partir des rapports fournis.",
    "stages": {
      "handover": {
        "title": "Prenez le quart",
        "brief": "Il est 02:00 et vous montez prendre le quart.",
        "goal": "Choisissez ce que la relève doit couvrir.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "deck": {
            "label": "Sur le pont",
            "text": "Le quart sortant dit « tout va bien » et commence à descendre."
          }
        },
        "fields": {
          "cover": {
            "label": "Demander",
            "options": {
              "position": "Le cap et la position",
              "traffic": "Les navires en vue",
              "weather": "La météo et le baromètre",
              "orders": "Les consignes du chef de bord",
              "nothing": "Rien ; « tout va bien » suffit"
            }
          }
        }
      },
      "call": {
        "title": "Appeler le chef de bord ?",
        "brief": "À 03:10, les feux d’un navire se rapprochent à relèvement constant.",
        "goal": "Décidez.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "orders": {
            "label": "Consignes permanentes",
            "text": "Appeler le chef de bord pour tout navire qui se rapproche à relèvement constant, tout changement de temps ou tout doute."
          }
        },
        "fields": {
          "act": {
            "label": "Que faites-vous ?",
            "options": {
              "call": "Appeler le chef de bord maintenant",
              "wait": "Attendre qu’il soit très proche",
              "log": "Seulement le noter dans le livre de bord"
            }
          }
        }
      },
      "anchor": {
        "title": "Mouillez pour la nuit",
        "brief": "Vous mouillez dans une baie et le vent peut tourner après minuit.",
        "goal": "Organisez la veille au mouillage.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "bay": {
            "label": "Baie",
            "text": "Un phare et une jetée sont visibles ; le GPS a une alarme de mouillage."
          }
        },
        "fields": {
          "set": {
            "label": "Mettre en place",
            "options": {
              "bearings": "Prendre des relèvements du phare et de la jetée",
              "alarm": "Régler l’alarme de mouillage du GPS",
              "light": "Allumer le feu de mouillage",
              "sleep": "Tout le monde dort ; une ancre ne chasse jamais"
            }
          }
        }
      }
    }
  },
  "decision-sail-73": {
    "title": "Agissez en chef de bord",
    "brief": "Remplissez les devoirs du chef de bord : papiers, appel de détresse, avis aux navigateurs et environnement.",
    "limitations": "Cet exercice évalue des devoirs généraux. Vérifiez la réglementation en vigueur dans votre pays avant de partir.",
    "stages": {
      "papers": {
        "title": "Vérifiez les papiers",
        "brief": "Avant une sortie côtière, vous vérifiez les papiers du bateau.",
        "goal": "Choisissez ce qui doit être à bord et valide.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "folder": {
            "label": "Pochette",
            "text": "Licence, certificat de navigabilité, police d’assurance, votre permis, un vieux reçu de marina."
          }
        },
        "fields": {
          "papers": {
            "label": "Doit être valide et à bord",
            "options": {
              "licence": "La licence du bateau",
              "seaworthy": "Le certificat de navigabilité",
              "insurance": "La police d’assurance",
              "skipper": "Votre permis de chef de bord"
            }
          }
        }
      },
      "distress": {
        "title": "Un appel de détresse",
        "brief": "En route, vous entendez un Mayday d’un voilier à 5 NM. La mer est modérée.",
        "goal": "Choisissez vos actions.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "you": {
            "label": "Votre bateau",
            "text": "Vous êtes bien préparé et pouvez le rejoindre en une heure."
          }
        },
        "fields": {
          "act": {
            "label": "À faire",
            "options": {
              "help": "Aller lui porter assistance si c’est sans danger",
              "reply": "Répondre à l’appel en donnant votre position et le temps pour le rejoindre",
              "log": "Le noter dans le livre de bord",
              "ignore": "Continuer ; quelqu’un d’autre ira"
            }
          }
        }
      },
      "rules": {
        "title": "Préparez la journée",
        "brief": "Des amis proposent de vous payer pour les emmener dans une réserve naturelle.",
        "goal": "Choisissez ce qui est correct.",
        "success": "Étape validée. Le plan engagé est conservé pour la suivante.",
        "retry": "Relisez les informations et corrigez la tâche signalée. Cette étape n’est pas validée.",
        "facts": {
          "notice": {
            "label": "Avis aux navigateurs",
            "text": "Exercices de tir demain dans une zone sur votre route."
          },
          "reserve": {
            "label": "Réserve",
            "text": "Le mouillage sur les herbiers marins est interdit dans la réserve."
          }
        },
        "fields": {
          "pay": {
            "label": "Pouvez-vous les emmener contre paiement ?",
            "options": {
              "no": "Non ; transporter des passagers payants demande un permis spécial",
              "yes": "Oui, avec un permis de plaisance"
            }
          },
          "plan": {
            "label": "Plan",
            "options": {
              "avoid": "Contourner la zone de tir",
              "sand": "Mouiller seulement sur le sable",
              "rubbish": "Rapporter tous les déchets au port",
              "seagrass": "Mouiller sur les herbiers, parce que l’ancre y tient bien"
            }
          }
        }
      }
    }
  },
};
