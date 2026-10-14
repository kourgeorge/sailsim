import colregs from './colregs-es.js';
// Original scenario translations; numeric fixtures and assessment rules remain canonical.
export default {
  ...colregs,
  "decision-sail-01": {
    "title": "Preparar Meridian para zarpar",
    "brief": "Preparas el yate ficticio Meridian con dos tripulantes nuevos. Resuelve el defecto del equipo, reparte funciones y confirma el plan de salida.",
    "limitations": "Evalúa decisiones a partir de informes. No inspecciona equipos reales ni evalúa el trabajo físico de la tripulación.",
    "stages": {
      "equipment": {
        "title": "Resolver el defecto del equipo",
        "brief": "Consulta el inventario y el informe de tripulación antes de autorizar la salida.",
        "goal": "Proporciona un chaleco adecuado a cada persona antes de superar esta etapa.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "inventory": {
            "label": "Inventario del equipo",
            "text": "Hay tres personas a bordo. Dos chalecos son adecuados; el tercero es demasiado grande. El armario de repuestos contiene la talla correcta."
          },
          "crew": {
            "label": "Informe de tripulación",
            "text": "El nuevo tripulante no ha ajustado ni comprobado el chaleco de repuesto. Un chaleco flojo no está listo para usarse."
          }
        },
        "fields": {
          "prepare": {
            "label": "Confirmar las acciones de preparación necesarias",
            "options": {
              "replace": "Recoger el repuesto adecuado",
              "fit": "Ajustar y comprobar todos los chalecos",
              "ignore": "Salir con el chaleco demasiado grande",
              "stow": "Guardar todos los chalecos bajo cubierta"
            }
          }
        }
      },
      "roles": {
        "title": "Repartir las funciones de salida",
        "brief": "El defecto está resuelto. Asigna una función principal a cada persona y explica los riesgos.",
        "goal": "Asigna tres funciones distintas y explica los dos riesgos representados.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "people": {
            "label": "Tripulación disponible",
            "text": "Alex tiene experiencia al timón. Sam puede mantener la vigilancia. Jo puede manejar los cabos preparados bajo supervisión."
          },
          "hazards": {
            "label": "Riesgos en la bañera",
            "text": "La botavara puede barrer la bañera. Los cabos cargados y los winches pueden atrapar dedos."
          }
        },
        "fields": {
          "alex": {
            "label": "Función de Alex",
            "options": {
              "helm": "Timón",
              "lookout": "Vigilancia",
              "lines": "Cabos preparados"
            }
          },
          "sam": {
            "label": "Función de Sam",
            "options": {
              "helm": "Timón",
              "lookout": "Vigilancia",
              "lines": "Cabos preparados"
            }
          },
          "jo": {
            "label": "Función de Jo",
            "options": {
              "helm": "Timón",
              "lookout": "Vigilancia",
              "lines": "Cabos preparados"
            }
          },
          "briefing": {
            "label": "Incluir en la explicación",
            "options": {
              "boom": "Mantenerse fuera del barrido de la botavara",
              "hands": "Mantener las manos lejos de cabos cargados",
              "jump": "Saltar a tierra para detener el barco"
            }
          }
        }
      },
      "release": {
        "title": "Validar la lista de salida",
        "brief": "La ruta y la tripulación están preparadas. Consulta los informes finales antes de decidir salir.",
        "goal": "Confirma solo cuando la preparación indicada esté completa y exista un criterio de regreso.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "forecast": {
            "label": "Previsión y ruta",
            "text": "La ruta abrigada propuesta respeta los límites acordados durante todo el viaje previsto y su margen de reserva."
          },
          "status": {
            "label": "Informe final",
            "text": "Los chalecos están ajustados y las funciones explicadas; se han comprobado seguridad, comunicaciones y estado del barco."
          },
          "trigger": {
            "label": "Criterio de regreso",
            "text": "Regresa antes del tramo expuesto si la visibilidad impide ver las referencias costeras previstas."
          }
        },
        "fields": {
          "decision": {
            "label": "Decisión de salida",
            "options": {
              "depart": "Seguir el plan abrigado comprobado",
              "unchecked": "Salir por una ruta de altura sin comprobar",
              "skip": "Omitir los informes finales"
            }
          },
          "trigger": {
            "label": "Anotar el criterio de regreso",
            "options": {
              "visibility": "Pérdida de las referencias costeras previstas",
              "promise": "Solo después de llegar al destino",
              "none": "Sin criterio de regreso"
            }
          }
        }
      }
    }
  },
  "decision-sail-02": {
    "title": "Dar indicaciones a bordo",
    "brief": "Coloca equipo y tripulantes usando referencias del barco y repite al cambiar el punto de vista.",
    "limitations": "Evalúa términos espaciales en un esquema, no los desplazamientos por un yate real.",
    "stages": {
      "identify": {
        "title": "Rotular el plano del yate",
        "brief": "El dibujo se ve desde arriba, con la proa en la parte superior.",
        "goal": "Asigna los nombres fijos del barco a las cuatro posiciones señaladas.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "orientation": {
            "label": "Dirección de la vista",
            "text": "Miras el yate desde arriba; la proa está arriba. Babor y estribor se definen mirando hacia proa."
          }
        },
        "fields": {
          "top": {
            "label": "Marca superior",
            "options": {
              "bow": "Proa",
              "stern": "Popa",
              "port": "Babor",
              "starboard": "Estribor"
            }
          },
          "bottom": {
            "label": "Marca inferior",
            "options": {
              "bow": "Proa",
              "stern": "Popa",
              "port": "Babor",
              "starboard": "Estribor"
            }
          },
          "left": {
            "label": "Marca izquierda",
            "options": {
              "bow": "Proa",
              "stern": "Popa",
              "port": "Babor",
              "starboard": "Estribor"
            }
          },
          "right": {
            "label": "Marca derecha",
            "options": {
              "bow": "Proa",
              "stern": "Popa",
              "port": "Babor",
              "starboard": "Estribor"
            }
          }
        }
      },
      "dispatch": {
        "title": "Enviar a la tripulación a sus puestos",
        "brief": "Elige destinos relativos al barco para dos tripulantes.",
        "goal": "Sitúa al vigía a proa y al ayudante en el costado indicado.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "orders": {
            "label": "Órdenes a la tripulación",
            "text": "Envía al vigía al puesto de proa y al ayudante al lado de estribor de la bañera. La proa sigue arriba."
          }
        },
        "fields": {
          "lookout": {
            "label": "Destino del vigía",
            "options": {
              "bow": "Puesto de proa",
              "stern": "Puesto de popa",
              "port": "Bañera de babor",
              "starboard": "Bañera de estribor"
            }
          },
          "helper": {
            "label": "Destino del ayudante",
            "options": {
              "bow": "Puesto de proa",
              "stern": "Puesto de popa",
              "port": "Bañera de babor",
              "starboard": "Bañera de estribor"
            }
          }
        }
      },
      "reverse-view": {
        "title": "Repetir desde la vista opuesta",
        "brief": "El plano ha girado media vuelta. Los nombres relativos al barco no cambian.",
        "goal": "Reasigna correctamente las marcas de pantalla tras cambiar la vista.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "rotation": {
            "label": "Vista modificada",
            "text": "Ahora la proa está abajo. La izquierda y la derecha de la pantalla han cambiado respecto al barco."
          }
        },
        "fields": {
          "left": {
            "label": "La marca izquierda identifica ahora",
            "options": {
              "port": "Babor",
              "starboard": "Estribor",
              "bow": "Proa"
            }
          },
          "right": {
            "label": "La marca derecha identifica ahora",
            "options": {
              "port": "Babor",
              "starboard": "Estribor",
              "stern": "Popa"
            }
          },
          "bottom": {
            "label": "La marca inferior identifica ahora",
            "options": {
              "bow": "Proa",
              "stern": "Popa",
              "port": "Babor"
            }
          }
        }
      }
    }
  },
  "decision-sail-03": {
    "title": "Preparar los mandos de las velas",
    "brief": "Planifica los mandos y la izada; después responde a un cabo enganchado antes de aumentar la carga.",
    "limitations": "Son decisiones de mandos y procedimientos. El manejo real de cabos, las cargas y los procedimientos del equipo requieren práctica supervisada.",
    "stages": {
      "map": {
        "title": "Asignar mandos a tareas",
        "brief": "Usa la ficha del equipo para completar la orden de trabajo.",
        "goal": "Asigna la izada y el ajuste angular a los cabos adecuados.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "equipment": {
            "label": "Funciones de los mandos",
            "text": "Las drizas izan las velas. Las escotas ajustan su ángulo. Los rizos reducen su superficie."
          }
        },
        "fields": {
          "raise": {
            "label": "Izar la mayor con",
            "options": {
              "halyard": "Driza de mayor",
              "sheet": "Escota de mayor",
              "rode": "Línea de fondeo"
            }
          },
          "angle": {
            "label": "Ajustar el ángulo de la vela de proa con",
            "options": {
              "halyard": "Driza de la vela de proa",
              "sheet": "Escota de la vela de proa",
              "reef": "Mando de rizos"
            }
          }
        }
      },
      "prepare": {
        "title": "Preparar el procedimiento de izada",
        "brief": "El yate está en aguas libres. Ordena las tareas antes de cargar la driza.",
        "goal": "Comprueba tripulación y cabos, descarga la vela y comienza la izada.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "procedure": {
            "label": "Procedimiento del barco para este ejercicio",
            "text": "Primero comprueba espacio libre, tripulación y cabos; luego larga escota y mantén la vela descargada; solo entonces iza."
          }
        },
        "fields": {
          "sequence": {
            "label": "Ordenar la secuencia de trabajo",
            "options": {
              "check": "Comprobar espacio libre, tripulación y cabos",
              "unload": "Largar escota y descargar la vela",
              "hoist": "Comenzar la izada"
            }
          }
        }
      },
      "foul": {
        "title": "Responder a un enganche",
        "brief": "La vela deja de subir y la carga del cabo aumenta inesperadamente.",
        "goal": "Deja de aumentar la carga y organiza una inspección segura antes de continuar.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "snag": {
            "label": "Nuevo informe del equipo",
            "text": "Una driza está enganchada. La tripulación aún no puede localizar el enganche con seguridad. Tirar más puede dañar el equipo o lesionar a alguien."
          }
        },
        "fields": {
          "response": {
            "label": "Confirmar la respuesta",
            "options": {
              "stop": "Detener la izada y dejar de cargar",
              "inspect": "Descargar e inspeccionar según el procedimiento seguro del barco",
              "force": "Forzar el winche para superar el enganche"
            }
          }
        }
      }
    }
  },
  "decision-sail-05": {
    "title": "Fijar un rumbo teniendo en cuenta el viento",
    "brief": "Sitúa el viento en la brújula y mantén el rumbo previsto fuera del sector de proa al viento del modelo después de un role.",
    "limitations": "Se utiliza el sector excluido del simulador. Los ángulos navegables de un yate real dependen de su diseño y las condiciones.",
    "stages": {
      "wind": {
        "title": "Colocar las dos flechas del viento",
        "brief": "Usa la previsión para distinguir origen y destino.",
        "goal": "Introduce las demoras de procedencia del viento y movimiento del aire.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "wind": {
            "label": "Informe del viento",
            "text": "El viento viene de 315°. Las demoras aumentan en sentido horario desde el norte. El aire se mueve en sentido opuesto."
          }
        },
        "fields": {
          "windFrom": {
            "label": "El viento viene de",
            "options": {}
          },
          "airToward": {
            "label": "El aire se mueve hacia",
            "options": {}
          }
        }
      },
      "course": {
        "title": "Situar el rumbo fuera del sector excluido",
        "brief": "El modelo excluye rumbos a menos de 38° del origen del viento.",
        "goal": "Fija un rumbo de través e identifica el sector excluido.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "zone": {
            "label": "Límite del modelo",
            "text": "Con viento de 315°, el sector excluido va de 277° a 353° pasando por 315°. El través está a 90° del origen del viento."
          }
        },
        "fields": {
          "heading": {
            "label": "Fijar el rumbo de través hacia el nordeste",
            "options": {}
          },
          "excluded": {
            "label": "Marcar el rumbo excluido",
            "options": {
              "45": "045°",
              "225": "225°",
              "315": "315°"
            }
          }
        }
      },
      "shift": {
        "title": "Revisar tras el role del viento",
        "brief": "El nuevo viento hace innavegable el rumbo de 330° considerado antes.",
        "goal": "Sustitúyelo por el rumbo de través indicado.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "shift": {
            "label": "Viento actualizado",
            "text": "Ahora el viento viene de 000°. El rumbo 330° está a 30° del origen y el 090° a 90°."
          }
        },
        "fields": {
          "windFrom": {
            "label": "Actualizar la flecha de procedencia del viento",
            "options": {}
          },
          "revisedHeading": {
            "label": "Confirmar el rumbo revisado",
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
    "title": "Crear un registro de viento aparente",
    "brief": "Completa tres casos instrumentales con el viento relativo al yate en movimiento.",
    "limitations": "Son ejercicios vectoriales colineales exactos bajo supuestos indicados, no prestaciones medidas de un yate.",
    "stages": {
      "stationary": {
        "title": "Registrar el caso estacionario",
        "brief": "El yate está inmóvil respecto al suelo con viento del norte de 10 nudos.",
        "goal": "Anota el viento aparente antes de moverse.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "case": {
            "label": "Observación A",
            "text": "El viento real viene de 000° a 10 kn. La velocidad del barco y la corriente son cero."
          }
        },
        "fields": {
          "apparentSpeed": {
            "label": "Velocidad del viento aparente",
            "options": {}
          },
          "source": {
            "label": "El viento aparente viene de",
            "options": {
              "north": "Norte",
              "south": "Sur",
              "none": "Sin dirección"
            }
          }
        }
      },
      "upwind": {
        "title": "Registrar el caso de viento de proa",
        "brief": "En este ejercicio vectorial el yate avanza al norte a motor a 4 nudos.",
        "goal": "Resta la velocidad del barco a la del aire.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "case": {
            "label": "Observación B",
            "text": "El viento sigue viniendo de 000° a 10 kn. El barco se mueve a 4 kn hacia 000°. Sin corriente: es un ejemplo vectorial, no navegación a vela contra el viento."
          }
        },
        "fields": {
          "apparentSpeed": {
            "label": "Velocidad del viento aparente",
            "options": {}
          },
          "relative": {
            "label": "Viento relativo a la proa",
            "options": {
              "ahead": "Desde proa",
              "astern": "Desde popa",
              "beam": "Desde el través"
            }
          }
        }
      },
      "downwind": {
        "title": "Registrar el caso a favor del viento",
        "brief": "Ahora el yate se mueve al sur a 4 nudos con el mismo viento.",
        "goal": "Actualiza el registro e identifica el viento usado para trimar las velas.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "case": {
            "label": "Observación C",
            "text": "El aire sigue moviéndose a 10 kn hacia el sur. El barco va ahora a 4 kn hacia el sur. La corriente sigue siendo cero."
          }
        },
        "fields": {
          "apparentSpeed": {
            "label": "Velocidad del viento aparente",
            "options": {}
          },
          "trimReference": {
            "label": "Usar para el trimado del modelo",
            "options": {
              "apparent": "Viento relativo al yate en movimiento",
              "true": "Solo viento real referido al suelo",
              "none": "Ignorar la dirección del viento"
            }
          }
        }
      }
    }
  },
  "decision-sail-20": {
    "title": "Elegir una ventana de salida",
    "brief": "Compara la previsión horaria con los límites de la tripulación y responde a un boletín revisado.",
    "limitations": "Los límites de viento y visibilidad son objetivos del ejercicio, no límites universales de seguridad. No se usa una previsión en directo.",
    "stages": {
      "limits": {
        "title": "Fijar los límites del plan",
        "brief": "Lee el acuerdo de la tripulación antes de evaluar horarios de salida.",
        "goal": "Anota ambos límites y la ventana completa de previsión necesaria.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "crew": {
            "label": "Límites del ejercicio",
            "text": "En este viaje ficticio se acuerdan rachas de hasta 18 kn y visibilidad mínima de 3 NM."
          },
          "duration": {
            "label": "Margen del viaje",
            "text": "El viaje dura 2 horas y requiere 1 hora adicional de margen de previsión."
          }
        },
        "fields": {
          "gustLimit": {
            "label": "Racha máxima",
            "options": {}
          },
          "visibilityLimit": {
            "label": "Visibilidad mínima",
            "options": {}
          },
          "window": {
            "label": "Cobertura de previsión desde la salida",
            "options": {}
          }
        }
      },
      "window": {
        "title": "Elegir la ventana útil",
        "brief": "Compara las condiciones durante el viaje completo y su reserva.",
        "goal": "Elige la salida cuya ventana completa respete los límites.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "early": {
            "label": "Boletín temprano",
            "text": "De 08:00 a 11:00: rachas de 14–17 kn, visibilidad de 5 NM."
          },
          "late": {
            "label": "Boletín posterior",
            "text": "De 11:00 a 15:00: rachas de 22 kn, visibilidad de 2 NM."
          }
        },
        "fields": {
          "departure": {
            "label": "Confirmar la hora de salida",
            "options": {
              "1000": "10:00",
              "1200": "12:00",
              "0800": "08:00"
            }
          }
        }
      },
      "revision": {
        "title": "Aplicar el nuevo boletín",
        "brief": "Antes de salir, una actualización adelanta el empeoramiento.",
        "goal": "Cambia el plan mientras el yate sigue amarrado con seguridad.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "update": {
            "label": "Boletín revisado",
            "text": "Ahora se prevén rachas de 22 kn y visibilidad de 2 NM desde las 09:00. El plan de las 08:00 ya no dispone de tres horas válidas."
          }
        },
        "fields": {
          "decision": {
            "label": "Estado de salida revisado",
            "options": {
              "wait": "Esperar y reevaluar otra ventana aceptable",
              "go": "Salir con la previsión sustituida",
              "faster": "Salir suponiendo que más velocidad resuelve el mal tiempo"
            }
          },
          "notify": {
            "label": "Actualizar el plan registrado",
            "options": {
              "crew": "Informar a la tripulación del aplazamiento",
              "forecast": "Anotar el boletín revisado",
              "delete": "Eliminar los límites del plan"
            }
          }
        }
      }
    }
  },
  "decision-sail-21": {
    "title": "Trazar una ruta alrededor de la isla",
    "brief": "Inspecciona una carta ficticia, construye una ruta segura y comprueba qué información exigir antes de usar una carta real.",
    "limitations": "La geometría es ficticia y no sirve para navegar. Evitar la isla no garantiza profundidad ni seguridad reales.",
    "stages": {
      "inspect": {
        "title": "Inspeccionar la información de la carta",
        "brief": "La carta es un esquema de entrenamiento con el norte arriba.",
        "goal": "Identifica qué demuestra la carta y qué no.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "chart": {
            "label": "Información de la carta",
            "text": "Esta carta ficticia muestra una isla y puntos de ruta. Las boyas ámbar son objetivos de ejercicio, no un sistema IALA completo."
          },
          "limits": {
            "label": "Información real ausente",
            "text": "No se proporciona levantamiento hidrográfico actual, datum de carta ni altura de marea en directo."
          }
        },
        "fields": {
          "available": {
            "label": "Marcar lo que permite este esquema",
            "options": {
              "orientation": "Orientación con norte arriba",
              "island": "Situación de la isla representada",
              "tide": "Resguardo real de marea garantizado"
            }
          },
          "marks": {
            "label": "Clasificar las marcas ámbar",
            "options": {
              "targets": "Objetivos de entrenamiento",
              "iala": "Balizamiento IALA completo",
              "safe": "Prueba de aguas seguras"
            }
          }
        }
      },
      "route": {
        "title": "Construir una ruta despejada",
        "brief": "Ve de S a F por el corredor inferior. Todos los tramos deben evitar la isla.",
        "goal": "Confirma la secuencia de puntos por A y B.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "route": {
            "label": "Requisito de la ruta",
            "text": "Sal de S, pasa por A y después B en el corredor inferior y termina en F. X está dentro de la isla y no es seguro."
          }
        },
        "fields": {
          "route": {
            "label": "Puntos de ruta ordenados",
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
        "title": "Preparar la solicitud de carta real",
        "brief": "La ruta evita la isla dibujada. Eso no basta para aprobar una travesía real.",
        "goal": "Solicita la información ausente antes de navegar de verdad.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "status": {
            "label": "Esquema completado",
            "text": "La ruta trazada está geométricamente despejada en el ejercicio ficticio. Las profundidades y los peligros reales no están validados."
          }
        },
        "fields": {
          "request": {
            "label": "Solicitar antes del uso real",
            "options": {
              "chart": "Carta oficial adecuada y actualizada y avisos",
              "tide": "Información compatible de marea y profundidad",
              "rules": "Información local aplicable de navegación",
              "approve": "Aprobar solo por el esquema de entrenamiento"
            }
          }
        }
      }
    }
  },
  "decision-sail-23": {
    "title": "Llevar el registro de tiempos de travesía",
    "brief": "Calcula dos tramos, confirma una llegada y revísala con el avance real.",
    "limitations": "El registro evalúa cálculos y actualizaciones con supuestos dados. Las estimaciones reales incluyen cambios e incertidumbre.",
    "stages": {
      "legs": {
        "title": "Calcular los tramos previstos",
        "brief": "Ambos tramos usan una velocidad sobre el fondo constante de 4 nudos en este ejercicio.",
        "goal": "Introduce la duración de cada tramo en minutos.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "legs": {
            "label": "Ficha de ruta",
            "text": "El tramo A mide 3 NM y el B 2 NM. La estimación inicial no incluye corriente, paradas ni cambios de velocidad."
          }
        },
        "fields": {
          "legA": {
            "label": "Duración del tramo A",
            "options": {}
          },
          "legB": {
            "label": "Duración del tramo B",
            "options": {}
          }
        }
      },
      "arrival": {
        "title": "Confirmar la llegada estimada",
        "brief": "Usa ambas duraciones en un único registro de travesía.",
        "goal": "Anota duración total y llegada en minutos después de las 13:00.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "departure": {
            "label": "Registro de salida",
            "text": "La salida es a las 13:00. Las duraciones previstas son 45 y 30 minutos."
          }
        },
        "fields": {
          "total": {
            "label": "Duración total prevista",
            "options": {}
          },
          "arrivalMinutes": {
            "label": "Llegada: minutos después de las 13:00",
            "options": {}
          }
        }
      },
      "update": {
        "title": "Actualizar tras un retraso",
        "brief": "El primer tramo duró más de lo previsto. Mantén los supuestos del segundo.",
        "goal": "Sustituye la llegada prevista por la estimada con el avance observado.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "actual": {
            "label": "Registro real",
            "text": "El tramo A terminó a las 14:00 tras 60 minutos. El B sigue requiriendo 30 minutos."
          },
          "deadline": {
            "label": "Margen de llegada",
            "text": "La llegada límite del ejercicio es a las 15:00."
          }
        },
        "fields": {
          "arrivalMinutes": {
            "label": "Llegada revisada: minutos después de las 13:00",
            "options": {}
          },
          "reserve": {
            "label": "Minutos restantes antes de las 15:00",
            "options": {}
          }
        }
      }
    }
  },
  "decision-sail-25": {
    "title": "Elaborar un informe de vigilancia",
    "brief": "Inspecciona los sectores, compara observaciones sucesivas y mantén abierto el riesgo no resuelto.",
    "limitations": "Evalúa la interpretación de observaciones dadas, no la detección visual en tiempo real ni las maniobras físicas anticolisión.",
    "stages": {
      "scan": {
        "title": "Recoger las observaciones",
        "brief": "Una vela tapa parte de la vista hacia proa. Utiliza la información disponible de todos los sectores.",
        "goal": "Anota el sector oculto y completa el informe.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "ahead": {
            "label": "Sector de proa",
            "text": "Hay un contacto por proa a demora 045°. Una vela oculta parte de la vista."
          },
          "port": {
            "label": "Sector de babor",
            "text": "No se comunica ningún contacto en esta observación."
          },
          "starboard": {
            "label": "Sector de estribor",
            "text": "Se ve un barco lejano; aún no hay tendencia de movimiento."
          },
          "astern": {
            "label": "Sector de popa",
            "text": "El agua por popa está despejada en esta observación."
          }
        },
        "fields": {
          "obstruction": {
            "label": "Sector que requiere otro punto de observación",
            "options": {
              "ahead": "Por proa",
              "astern": "Por popa",
              "none": "Ninguno"
            }
          },
          "means": {
            "label": "Utilizar en la vigilancia continua",
            "options": {
              "sight": "Observaciones visuales desde una posición despejada",
              "hearing": "Oído",
              "appropriate": "Otros medios apropiados disponibles",
              "aisOnly": "Solo AIS"
            }
          }
        }
      },
      "trend": {
        "title": "Comparar el registro de contactos",
        "brief": "Dos observaciones añaden información de movimiento al avistamiento inicial.",
        "goal": "Señala el contacto cuya demora apenas cambia mientras se acerca.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "a": {
            "label": "Contacto A",
            "text": "Minuto 0: demora 045°, distancia 0,8 NM. Minuto 2: demora 045°, distancia 0,5 NM."
          },
          "b": {
            "label": "Contacto B",
            "text": "Solo hay una observación. Se desconoce su futura distancia de paso."
          }
        },
        "fields": {
          "risk": {
            "label": "Señalar la tendencia de aproximación peligrosa demostrada",
            "options": {
              "A": "Contacto A",
              "B": "Solo el contacto B",
              "none": "Ningún contacto"
            }
          },
          "unknown": {
            "label": "Estado del contacto B",
            "options": {
              "clear": "Paso seguro demostrado",
              "observe": "Necesita más observaciones",
              "ignore": "Ignorarlo por estar lejos"
            }
          }
        }
      },
      "recheck": {
        "title": "Seguir evaluando el riesgo",
        "brief": "Llega otra observación antes de conocer el resultado del paso.",
        "goal": "Actualiza sin declarar seguro un contacto no resuelto.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "new": {
            "label": "Nueva observación",
            "text": "El contacto A está ahora a 0,3 NM por el 045°. Sigue por proa; no se ha confirmado un paso seguro."
          }
        },
        "fields": {
          "status": {
            "label": "Estado del contacto A",
            "options": {
              "risk": "Persiste el riesgo de abordaje",
              "clear": "Seguro porque ya se observó",
              "finished": "Informe terminado"
            }
          },
          "next": {
            "label": "Próximo requisito del informe",
            "options": {
              "monitor": "Continuar la observación sistemática y evaluar medidas oportunas",
              "close": "Cerrar el registro de contactos",
              "screen": "Mirar solo el plotter"
            }
          }
        }
      }
    }
  },
  "decision-sail-26": {
    "title": "Asignar responsabilidades en encuentros",
    "brief": "Usa tres esquemas de encuentros bien delimitados para asignar responsabilidades y seguir vigilando el resultado.",
    "limitations": "Estos esquemas enseñan responsabilidades concretas. No prescriben un giro universal ni sustituyen las reglas completas aplicables.",
    "stages": {
      "opposite": {
        "title": "Asignar funciones con amuras opuestas",
        "brief": "Dos veleros están a la vista uno del otro en aguas abiertas.",
        "goal": "Asigna la responsabilidad inicial de mantenerse apartado.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "scope": {
            "label": "Ámbito del ejercicio",
            "text": "Reglas internacionales; ninguno alcanza al otro; no hay canal angosto, dispositivo de tráfico ni condición especial de buque."
          },
          "tacks": {
            "label": "Encuentro A",
            "text": "Tu yate navega amurado a babor. El otro va amurado a estribor y existe riesgo de abordaje."
          }
        },
        "fields": {
          "giveWay": {
            "label": "Buque que debe apartarse inicialmente",
            "options": {
              "own": "Tu yate",
              "other": "El otro yate",
              "neither": "Ninguno de los dos"
            }
          },
          "follow": {
            "label": "Después de tu maniobra evasiva",
            "options": {
              "monitor": "Comprobar su efecto hasta pasar y quedar franco",
              "stop": "Dejar de observar al mover el timón",
              "priority": "Reclamar prioridad permanente"
            }
          }
        }
      },
      "same": {
        "title": "Asignar funciones con la misma amura",
        "brief": "El segundo esquema muestra dos veleros con la misma amura.",
        "goal": "Asigna al barco de barlovento la obligación de apartarse.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "same": {
            "label": "Encuentro B",
            "text": "Ambos van amurados a estribor. Tu yate está a barlovento y el otro a sotavento. Los demás supuestos no cambian."
          }
        },
        "fields": {
          "giveWay": {
            "label": "Buque que debe apartarse",
            "options": {
              "own": "Tu yate de barlovento",
              "other": "El otro yate de sotavento",
              "neither": "Ninguno de los dos"
            }
          },
          "standOn": {
            "label": "Responsabilidad del otro buque",
            "options": {
              "none": "Sin más responsabilidades",
              "watch": "Cumplir sus obligaciones y actuar cuando sea necesario para evitar el abordaje",
              "ignore": "Ignorar el yate que se acerca"
            }
          }
        }
      },
      "overtake": {
        "title": "Aplicar el caso de alcance",
        "brief": "El encuentro ha cambiado en el último esquema: tu yate está alcanzando al otro.",
        "goal": "Distingue la obligación del buque que alcanza de las reglas simples de amuras.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "overtake": {
            "label": "Encuentro C",
            "text": "Tu yate se aproxima desde el sector de alcance por popa. Eres el buque que alcanza, independientemente de las amuras."
          }
        },
        "fields": {
          "giveWay": {
            "label": "Buque que debe apartarse",
            "options": {
              "own": "Tu yate que alcanza",
              "other": "El buque alcanzado",
              "tack": "Siempre el amurado a babor"
            }
          },
          "end": {
            "label": "¿Cuándo puede terminar la evaluación del alcance?",
            "options": {
              "clear": "Al haber pasado definitivamente y quedar franco",
              "abeam": "En cuanto esté al través",
              "signal": "Justo después de una señal"
            }
          }
        }
      }
    }
  },
  "decision-sail-27": {
    "title": "Elaborar un informe de luces y señales",
    "brief": "Separa las luces observadas de las conclusiones y prepara el registro de señales para las reglas indicadas.",
    "limitations": "El ejercicio cubre unas pocas identificaciones. No enseña el programa completo de luces, marcas y señales acústicas.",
    "stages": {
      "lights": {
        "title": "Anotar lo que realmente se ve",
        "brief": "Ves luces laterales roja y verde por proa, pero el resto del conjunto está oculto.",
        "goal": "Anota el aspecto sin inventar tipo de buque ni prioridad.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "view": {
            "label": "Conjunto visible",
            "text": "Se ven ambas luces laterales. No pueden confirmarse luces de tope, alcance ni condición especial."
          },
          "limit": {
            "label": "Límite de identificación",
            "text": "Las luces laterales solas no determinan el tipo ni la condición operativa completos."
          }
        },
        "fields": {
          "aspect": {
            "label": "Aspecto observado",
            "options": {
              "ahead": "Vista aproximadamente desde proa",
              "stern": "Vista solo de su popa",
              "none": "Ninguna observación útil"
            }
          },
          "status": {
            "label": "Informe del tipo de buque",
            "options": {
              "unknown": "Información insuficiente; obtener el conjunto completo",
              "sail": "Sin duda velero",
              "power": "Sin duda a motor"
            }
          }
        }
      },
      "sounds": {
        "title": "Completar el registro de señales de maniobra",
        "brief": "Usa el contexto internacional indicado de señales de maniobra entre buques a la vista.",
        "goal": "Asocia las tres señales acústicas con su significado.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "signals": {
            "label": "Referencia de señales",
            "text": "Una pitada corta: caigo a estribor. Dos: caigo a babor. Tres: doy atrás con la propulsión."
          }
        },
        "fields": {
          "one": {
            "label": "Una pitada corta",
            "options": {
              "starboard": "Caer a estribor",
              "port": "Caer a babor",
              "astern": "Operar la propulsión atrás"
            }
          },
          "two": {
            "label": "Dos pitadas cortas",
            "options": {
              "starboard": "Caer a estribor",
              "port": "Caer a babor",
              "astern": "Operar la propulsión atrás"
            }
          },
          "three": {
            "label": "Tres pitadas cortas",
            "options": {
              "moving": "Movimiento atrás garantizado",
              "astern": "Operar la propulsión atrás",
              "stopped": "Ya detenido"
            }
          }
        }
      },
      "context": {
        "title": "Gestionar un cambio de contexto de señales",
        "brief": "La niebla oculta al otro buque. La ficha anterior de señales de maniobra ya no es una guía completa.",
        "goal": "Actualiza el contexto y la información necesaria.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "fog": {
            "label": "Actualización de visibilidad",
            "text": "El otro buque ya no está a la vista. Se aplican señales de visibilidad reducida según su tipo y actividad."
          },
          "jurisdiction": {
            "label": "Nota de aplicabilidad",
            "text": "Se usan reglas internacionales; para un viaje real también hay que consultar las normas interiores y locales aplicables."
          }
        },
        "fields": {
          "context": {
            "label": "¿Qué marco de señales utilizar?",
            "options": {
              "restricted": "Las señales aplicables de visibilidad reducida",
              "same": "Solo la ficha anterior de una, dos y tres pitadas",
              "none": "Sin requisitos sonoros"
            }
          },
          "verify": {
            "label": "Verificar antes del uso real",
            "options": {
              "type": "Tipo de buque y estado operativo",
              "rules": "Reglas aplicables completas",
              "guess": "Adivinar por un solo color de luz"
            }
          }
        }
      }
    }
  },
  "decision-sail-28": {
    "title": "Revisar una travesía retrasada",
    "brief": "Elige destino según los límites de llegada y actualiza el plan si avanzas más despacio.",
    "limitations": "Es una práctica de gestión de travesía con horarios dados. No evalúa navegación ni meteorología reales.",
    "stages": {
      "compare": {
        "title": "Comparar márgenes de destino",
        "brief": "La tripulación principiante ha acordado una hora límite y dispone de dos destinos.",
        "goal": "Calcula el tiempo sobrante para cada opción.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "clock": {
            "label": "Hora de decisión",
            "text": "Son las 16:00. La llegada límite acordada es a las 17:00."
          },
          "routes": {
            "label": "Estimaciones actuales",
            "text": "El destino expuesto está a 45 minutos y la alternativa abrigada a 25."
          }
        },
        "fields": {
          "exposedMargin": {
            "label": "Margen del destino expuesto",
            "options": {}
          },
          "shelterMargin": {
            "label": "Margen de la alternativa abrigada",
            "options": {}
          }
        }
      },
      "delay": {
        "title": "Aplicar el informe de avance más lento",
        "brief": "Las estimaciones cambian a las 16:10.",
        "goal": "Elige un destino que aún respete el acuerdo.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "update": {
            "label": "Estimaciones actualizadas",
            "text": "El destino expuesto requiere ahora 70 minutos, llegada 17:20. El refugio requiere 35 minutos, llegada 16:45."
          }
        },
        "fields": {
          "destination": {
            "label": "Confirmar el destino",
            "options": {
              "exposed": "Destino expuesto",
              "shelter": "Alternativa abrigada"
            }
          },
          "reserve": {
            "label": "Margen de llegada al refugio elegido",
            "options": {}
          }
        }
      },
      "brief": {
        "title": "Actualizar el plan para tripulación y tierra",
        "brief": "Has elegido la alternativa abrigada. Confirma los cambios de información.",
        "goal": "Comunica nuevo destino, llegada estimada y motivo sin descartar el límite.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "plan": {
            "label": "Plan revisado",
            "text": "Destino: alternativa abrigada. Llegada 16:45. Motivo: el destino expuesto ya no respeta la llegada máxima de 17:00."
          }
        },
        "fields": {
          "updates": {
            "label": "Actualizar estos elementos",
            "options": {
              "destination": "Destino y ruta",
              "eta": "Llegada estimada y contacto pertinente en tierra",
              "crew": "Funciones de tripulación y explicación revisada de aproximación",
              "limit": "Eliminar el límite de llegada"
            }
          },
          "reason": {
            "label": "Anotar el motivo de la decisión",
            "options": {
              "margin": "Conservar el margen de llegada acordado",
              "promise": "Mantener la promesa inicial a cualquier precio",
              "speed": "La ruta aparentemente más rápida siempre es más segura"
            }
          }
        }
      }
    }
  },
  "decision-sail-29": {
    "title": "Preparar e interrumpir una aproximación",
    "brief": "Planifica un atraque por estribor, organiza a la tripulación y responde a una obstrucción antes de comprometerte.",
    "limitations": "Solo evalúa planificación y decisiones de tripulación. Quedan fuera el efecto transversal de la hélice, el contacto, los esprines y la competencia real de atraque.",
    "stages": {
      "prepare": {
        "title": "Preparar el costado de atraque",
        "brief": "El plan indicado acerca el costado de estribor al muelle.",
        "goal": "Coloca defensas y amarras en el costado previsto.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "berth": {
            "label": "Plan de atraque",
            "text": "Estribor al muelle. Prepara largos de proa y popa y esprines según el procedimiento del barco antes de aproximarte."
          },
          "crew": {
            "label": "Seguridad de la tripulación",
            "text": "Nadie debe saltar a tierra ni colocar manos o pies entre yate y muelle."
          }
        },
        "fields": {
          "fenders": {
            "label": "Costado de las defensas",
            "options": {
              "starboard": "Estribor",
              "port": "Babor",
              "none": "Sin defensas"
            }
          },
          "lines": {
            "label": "Preparar las amarras indicadas",
            "options": {
              "bow": "Largo de proa",
              "stern": "Largo de popa",
              "spring": "Esprines",
              "body": "Usar el cuerpo de un tripulante como defensa"
            }
          }
        }
      },
      "roles": {
        "title": "Explicar aproximación y escape",
        "brief": "Asigna control, observación y cabos antes de entrar en la aproximación.",
        "goal": "Conserva una vía de escape despejada y funciones seguras.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "roles": {
            "label": "Plan de tripulación",
            "text": "Alex gobierna. Sam canta distancias y vigila el escape. Jo maneja las amarras preparadas desde una posición segura bajo órdenes."
          },
          "escape": {
            "label": "Ruta de escape",
            "text": "Hay un corredor de agua libre a babor antes de la aproximación final. El ejercicio no requiere tocar el muelle."
          }
        },
        "fields": {
          "observer": {
            "label": "Tarea de Sam",
            "options": {
              "watch": "Cantar distancias y vigilar el corredor de escape",
              "jump": "Saltar al muelle",
              "push": "Empujar el yate con las manos"
            }
          },
          "escape": {
            "label": "Anotar el corredor de escape",
            "options": {
              "port": "Agua libre a babor antes de la aproximación final",
              "blocked": "El atraque ocupado",
              "none": "No hace falta escape"
            }
          }
        }
      },
      "obstruction": {
        "title": "Abortar antes de comprometerse",
        "brief": "El atraque está obstruido y la aproximación ya no es aceptable.",
        "goal": "Usa el escape previsto mientras siga abierto.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "change": {
            "label": "Nuevo informe",
            "text": "Una obstrucción ocupa el atraque. El corredor de agua libre a babor previamente explicado sigue abierto."
          },
          "limit": {
            "label": "Límite del control",
            "text": "Es un plan de decisión; no se evalúan fuerzas del motor o cabos ni contacto con el muelle."
          }
        },
        "fields": {
          "action": {
            "label": "Confirmar la decisión de aproximación",
            "options": {
              "abort": "Abortar por el corredor comprobado y reevaluar",
              "force": "Continuar y pedir que detengan físicamente el barco",
              "speed": "Acelerar hacia la obstrucción"
            }
          },
          "crew": {
            "label": "Instrucción a la tripulación",
            "options": {
              "safe": "Mantener posiciones seguras y seguir la explicación de escape",
              "jump": "Saltar a tierra rápidamente",
              "hands": "Poner las manos entre casco y muelle"
            }
          }
        }
      }
    }
  },
  "decision-sail-30": {
    "title": "Evaluar un fondeadero durante la marea",
    "brief": "Elige lugar, calcula la línea de fondeo indicada y revisa el círculo de borneo al subir la marea.",
    "limitations": "La proporción y la envolvente conservadora son supuestos del ejercicio. No prueban agarre, prescriben longitud real ni modelan la catenaria.",
    "stages": {
      "site": {
        "title": "Comparar las fichas de fondeaderos",
        "brief": "Utiliza las indicaciones del ancla y el requisito de abrigo.",
        "goal": "Elige el lugar que cumpla todas las condiciones indicadas.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "guidance": {
            "label": "Indicaciones del ancla del ejercicio",
            "text": "El ancla indicada es adecuada para el fondo de arena representado. La tripulación exige abrigo del viento previsto y al menos 40 m de radio libre de borneo para el plan inicial."
          },
          "sites": {
            "label": "Informes de lugares",
            "text": "A: arena abrigada, radio libre 60 m. B: roca expuesta, 70 m. C: arena abrigada, 35 m."
          }
        },
        "fields": {
          "site": {
            "label": "Elegir el fondeadero",
            "options": {
              "A": "A: arena abrigada, 60 m",
              "B": "B: roca expuesta, 70 m",
              "C": "C: arena abrigada, 35 m"
            }
          }
        }
      },
      "rode": {
        "title": "Calcular la envolvente inicial",
        "brief": "Aplica la regla aritmética dada, incluida la altura del rodillo.",
        "goal": "Calcula la línea y el radio de planificación conservador.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "initial": {
            "label": "Datos iniciales",
            "text": "Profundidad 5 m; rodillo de proa 1 m sobre el agua; proporción del ejercicio 5:1; eslora 10 m."
          },
          "radius": {
            "label": "Envolvente conservadora del ejercicio",
            "text": "Solo en esta ficha, usa longitud de línea más eslora como radio de borneo previsto."
          }
        },
        "fields": {
          "rode": {
            "label": "Longitud de la línea de fondeo",
            "options": {}
          },
          "radius": {
            "label": "Radio de borneo previsto",
            "options": {}
          }
        }
      },
      "tide": {
        "title": "Revisar en pleamar",
        "brief": "La previsión de altura de marea añade 2 m de profundidad.",
        "goal": "Actualiza la línea y comprueba que la envolvente sigue cabiendo.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "rise": {
            "label": "Profundidad modificada",
            "text": "La profundidad pasa a 7 m. No cambian altura del rodillo, proporción 5:1 ni eslora de 10 m."
          },
          "room": {
            "label": "Lugar elegido",
            "text": "El lugar A conserva 60 m de radio libre en la carta ficticia."
          }
        },
        "fields": {
          "rode": {
            "label": "Longitud de línea actualizada",
            "options": {}
          },
          "radius": {
            "label": "Radio previsto actualizado",
            "options": {}
          },
          "fit": {
            "label": "Comprobación de envolvente",
            "options": {
              "fits": "50 m caben en el radio libre indicado de 60 m",
              "same": "No hace falta recalcular",
              "guarantee": "Esto prueba que el ancla real agarrará"
            }
          }
        }
      }
    }
  },
  "decision-sail-33": {
    "title": "Coordinar una respuesta a hombre al agua",
    "brief": "Reparte funciones inmediatas, evalúa la capacidad de recuperación y prepara los pasos siguientes sin fingir un rescate.",
    "limitations": "Evalúa coordinación de emergencia y revisión del plan, no maniobras, recuperación, primeros auxilios ni uso seguro del equipo real.",
    "stages": {
      "immediate": {
        "title": "Asignar las acciones inmediatas",
        "brief": "Una persona ha caído al agua. Quedan tres tripulantes a bordo.",
        "goal": "Mantén observación mientras asignas alarma y flotación.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "crew": {
            "label": "Tripulación disponible",
            "text": "Alex está al timón. Sam mantiene contacto visual. Jo está junto al material de flotación y señalización."
          },
          "priority": {
            "label": "Prioridades inmediatas",
            "text": "Da la alarma, mantén contacto visual y proporciona flotación y señalización adecuadas. Pueden hacerse a la vez; no abandones la observación."
          }
        },
        "fields": {
          "sam": {
            "label": "Asignar a Sam",
            "options": {
              "spot": "Seguir señalando y mantener contacto visual",
              "leave": "Abandonar la vigilancia para buscar abajo",
              "swim": "Saltar al agua tras la persona"
            }
          },
          "jo": {
            "label": "Asignar a Jo",
            "options": {
              "alarmFloat": "Dar la alarma y lanzar flotación y señalización adecuadas",
              "wait": "Esperar a terminar la maniobra de regreso",
              "photo": "Fotografiar el incidente"
            }
          }
        }
      },
      "capability": {
        "title": "Comprobar la capacidad de recuperación",
        "brief": "La persona sigue visible, pero la tripulación no puede izar a una víctima inconsciente sin ayuda.",
        "goal": "Organiza ayuda y conserva un observador exclusivo mientras preparas la recuperación.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "casualty": {
            "label": "Informe de la víctima",
            "text": "La persona parece incapaz de colaborar. La tripulación no puede izarla con seguridad con su capacidad actual."
          },
          "equipment": {
            "label": "Informe del equipo",
            "text": "Hay un sistema de recuperación específico del barco, pero requiere personal formado. Hay equipo de comunicaciones."
          }
        },
        "fields": {
          "actions": {
            "label": "Confirmar las siguientes prioridades",
            "options": {
              "help": "Pedir asistencia inmediata adecuada",
              "spotter": "Mantener un observador exclusivo",
              "plan": "Preparar el plan de recuperación específico del barco",
              "alone": "Suponer que ponerse al costado completa el rescate"
            }
          }
        }
      },
      "recovery": {
        "title": "Revisar el plan de recuperación",
        "brief": "Un plan propone dejar girando la hélice cerca de la víctima y termina antes de izarla a bordo.",
        "goal": "Rechaza esa proximidad peligrosa e incluye la recuperación física.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "proposal": {
            "label": "Defectos del plan",
            "text": "La propuesta permite propulsión giratoria junto a la víctima y no prevé cómo subirla a bordo."
          },
          "boundary": {
            "label": "Límite del ejercicio",
            "text": "Aquí no se simulan maniobra de regreso ni izada de la víctima."
          }
        },
        "fields": {
          "corrections": {
            "label": "Correcciones necesarias",
            "options": {
              "propeller": "Prevenir lesiones de hélice según el procedimiento adecuado del barco",
              "lift": "Planear una izada o recuperación segura con ayuda y equipo adecuados",
              "contact": "Mantener observación durante todo el proceso",
              "accept": "Aceptar el plan incompleto"
            }
          }
        }
      }
    }
  },
  "decision-sail-34": {
    "title": "Preparar un mensaje de emergencia",
    "brief": "Lee un incidente en evolución, construye una ficha de socorro sin conexión y actualízala al cambiar el informe. No se transmite nada.",
    "limitations": "Es un ejercicio de preparación de mensajes sin conexión. No maneja radios, transmite socorro ni habilita para usar equipos de radio.",
    "stages": {
      "classify": {
        "title": "Clasificar el incidente en evolución",
        "brief": "Usa la gravedad del incidente, no la molestia del retraso.",
        "goal": "Elige el nivel adecuado para peligro grave e inminente.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "incident": {
            "label": "Incidente de entrenamiento",
            "text": "Meridian sufre una inundación incontrolada. La tripulación no puede controlar la entrada de agua y necesita ayuda externa inmediata."
          },
          "radio": {
            "label": "Ejercicio sin conexión",
            "text": "La ficha de radio es simulada. Nunca transmitas una alerta real de socorro para entrenar."
          }
        },
        "fields": {
          "urgency": {
            "label": "Prioridad del mensaje",
            "options": {
              "distress": "Socorro: peligro grave e inminente que requiere asistencia inmediata",
              "routine": "Actualización rutinaria de llegada",
              "none": "No hace falta llamar"
            }
          },
          "facility": {
            "label": "Procedimiento de entrenamiento aplicable",
            "options": {
              "distress": "Procedimiento de socorro DSC apropiado y MAYDAY en VHF 16 cuando esté disponible y sea aplicable",
              "test": "Enviar una alerta real solo para probar",
              "social": "Publicar solo en redes sociales"
            }
          }
        }
      },
      "message": {
        "title": "Completar la ficha de socorro",
        "brief": "Usa la ficha actual del incidente para rellenar los campos esenciales.",
        "goal": "Anota identidad, posición, emergencia y ayuda necesaria.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "identity": {
            "label": "Ficha de identidad",
            "text": "Nombre del buque: Meridian. Es ficticio para entrenamiento."
          },
          "position": {
            "label": "Ficha de posición",
            "text": "Posición de entrenamiento: 36°10.0′N, 005°20.0′W, anotada a las 12:10 UTC."
          },
          "incident": {
            "label": "Ficha del incidente",
            "text": "Inundación incontrolada; tres personas a bordo; se necesita asistencia inmediata y apoyo de recuperación."
          }
        },
        "fields": {
          "identity": {
            "label": "Identidad del buque",
            "options": {
              "meridian": "Meridian",
              "unknown": "Desconocida pese a la ficha de identidad",
              "other": "Otro buque"
            }
          },
          "position": {
            "label": "Posición que comunicar",
            "options": {
              "current": "36°10.0′N, 005°20.0′W a las 12:10 UTC",
              "old": "Atraque de salida de ayer",
              "omit": "Omitir la posición"
            }
          },
          "details": {
            "label": "Incluir estos detalles del incidente",
            "options": {
              "flood": "Inundación incontrolada",
              "people": "Tres personas a bordo",
              "help": "Se requiere asistencia inmediata y apoyo de recuperación",
              "arrived": "Todos han llegado a salvo"
            }
          }
        }
      },
      "update": {
        "title": "Actualizar el registro del mensaje",
        "brief": "La tripulación espera ayuda. Hay una observación de posición más reciente.",
        "goal": "Usa la información fechada más reciente y sigue vigilando la emergencia.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "newPosition": {
            "label": "Posición actualizada",
            "text": "A las 12:15 UTC, la posición de entrenamiento es 36°10.1′N, 005°19.8′W. La inundación sigue incontrolada; los tres permanecen a bordo."
          },
          "status": {
            "label": "Estado actual",
            "text": "La posición de las 12:10 ya es una observación histórica, no la última posición."
          }
        },
        "fields": {
          "position": {
            "label": "Actualización de posición",
            "options": {
              "new": "36°10.1′N, 005°19.8′W a las 12:15 UTC",
              "old": "Repetir solo la posición antigua",
              "none": "Dejar de actualizar la posición"
            }
          },
          "continue": {
            "label": "Continuar la respuesta",
            "options": {
              "people": "Proteger y contabilizar a las personas",
              "updates": "Informar al servicio de asistencia según corresponda",
              "procedure": "Seguir los procedimientos de emergencia del barco",
              "power": "Aplicar plena potencia sin evaluar daños"
            }
          }
        }
      }
    }
  },
  "decision-sail-36": {
    "title": "Revisar tus pruebas y tu plan de formación",
    "brief": "Revisa un registro de ejemplo, identifica lo no evaluado y prepara un informe útil para un instructor.",
    "limitations": "Evalúa clasificación honesta de pruebas y un plan de formación. No concede licencia, certificado, tiempo de mar ni competencia física.",
    "stages": {
      "audit": {
        "title": "Clasificar las pruebas de ejemplo",
        "brief": "Utiliza solo lo que el registro demuestra realmente.",
        "goal": "Separa conocimientos, desempeño del modelo y habilidades físicas.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "record": {
            "label": "Registro de alumno de ejemplo",
            "text": "Se ha superado un cuestionario de tráfico y una virada ordenada en el modelo. Atraque e izada de víctima solo se han comentado."
          },
          "scope": {
            "label": "Categorías de pruebas",
            "text": "Los cuestionarios evalúan respuestas; las tareas del modelo evalúan estados simulados; ninguno demuestra habilidades físicas ausentes."
          }
        },
        "fields": {
          "traffic": {
            "label": "Prueba del cuestionario de tráfico",
            "options": {
              "knowledge": "Comprobación de conocimientos",
              "model": "Manejo medido del modelo",
              "physical": "Competencia física"
            }
          },
          "tack": {
            "label": "Prueba de virada ordenada del modelo",
            "options": {
              "knowledge": "Solo conocimientos",
              "model": "Desempeño medido del modelo",
              "physical": "Manejo validado de un yate real"
            }
          },
          "docking": {
            "label": "Prueba de atraque físico",
            "options": {
              "done": "Demostrada",
              "missing": "No evaluada",
              "automatic": "Implícita por el resultado de la virada"
            }
          }
        }
      },
      "plan": {
        "title": "Preparar la solicitud de formación supervisada",
        "brief": "Céntrate en habilidades físicas que el registro no demuestra.",
        "goal": "Incluye las áreas prácticas ausentes en la solicitud de evaluación supervisada.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "gaps": {
            "label": "Áreas físicas no evaluadas",
            "text": "No se han evaluado cabos bajo carga, atraque al costado ni izada de víctima. Se puede llevar el registro de virada del modelo para comentarlo."
          }
        },
        "fields": {
          "request": {
            "label": "Solicitar práctica supervisada en",
            "options": {
              "lines": "Manejo de cabos cargados y winches",
              "dock": "Manejo a motor y atraque real",
              "recovery": "Recuperación de víctima específica del barco",
              "license": "Licencia automática de patrón por la aplicación"
            }
          }
        }
      },
      "brief": {
        "title": "Preparar el informe para el instructor",
        "brief": "Resume con honestidad sin atribuirte titulaciones reales.",
        "goal": "Incluye pruebas observadas, límites y la siguiente evaluación solicitada.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "handover": {
            "label": "Entrega útil",
            "text": "El instructor necesita experiencia previa, registro del modelo, dificultades y ayudas usadas, y objetivos prácticos solicitados."
          }
        },
        "fields": {
          "brief": {
            "label": "Incluir en el informe",
            "options": {
              "record": "Registro de conocimientos y tareas del modelo",
              "limits": "Tareas no evaluadas y límites del modelo",
              "help": "Dificultades y ayudas utilizadas",
              "goals": "Objetivos de práctica supervisada",
              "certified": "Afirmar ser patrón independiente certificado"
            }
          }
        }
      }
    }
  },
  "decision-sail-37": {
    "title": "Conservar una alternativa de escape costera",
    "brief": "Construye una ruta costera, calcula el último punto de desvío y cambia el plan al perder el margen previsto.",
    "limitations": "Es un problema ficticio de ruta y horarios. No establece pilotaje seguro, límites meteorológicos reales ni precisión de carta.",
    "stages": {
      "route": {
        "title": "Construir la ruta costera",
        "brief": "Pasa por la bifurcación D antes del cabo expuesto; usa B para evitar el peligro.",
        "goal": "Confirma la ruta completa de S a F pasando por D y B.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "route": {
            "label": "Instrucciones de ruta",
            "text": "S es la salida. D es la bifurcación de desvío. B libra el cabo. F es el destino expuesto. H es el refugio disponible desde D."
          }
        },
        "fields": {
          "route": {
            "label": "Ruta principal ordenada",
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
        "title": "Fijar el límite del punto de decisión",
        "brief": "El tramo final expuesto tiene una hora máxima de llegada.",
        "goal": "Calcula la última salida de D y el margen previsto.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "timing": {
            "label": "Horario de travesía",
            "text": "El tramo expuesto D–F dura 90 minutos. Hay que llegar antes de las 16:00. Se prevé llegar a D a las 14:00."
          },
          "escape": {
            "label": "Disponibilidad del desvío",
            "text": "La alternativa comprobada D–H dura 30 minutos y sigue siendo aceptable después de las 14:30."
          }
        },
        "fields": {
          "latest": {
            "label": "Última salida de D: minutos después de las 14:00",
            "options": {}
          },
          "margin": {
            "label": "Margen previsto en D",
            "options": {}
          }
        }
      },
      "divert": {
        "title": "Actuar en la bifurcación",
        "brief": "El avance lento hace llegar a D más tarde de lo previsto.",
        "goal": "Usa el refugio aún disponible y anota la nueva llegada.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "actual": {
            "label": "Llegada real a D",
            "text": "El yate llega a D a las 14:40. El tramo expuesto sigue durando 90 minutos y el refugio H está a 30."
          },
          "limit": {
            "label": "Límite de llegada sin cambios",
            "text": "La llegada máxima aceptable al destino expuesto sigue siendo 16:00."
          }
        },
        "fields": {
          "destination": {
            "label": "Confirmar el siguiente tramo",
            "options": {
              "H": "Desviarse al refugio H",
              "F": "Continuar al destino expuesto F",
              "wait": "Esperar aún más en la bifurcación"
            }
          },
          "arrival": {
            "label": "Llegada al refugio: minutos después de las 14:00",
            "options": {}
          }
        }
      }
    }
  },
  "decision-sail-38": {
    "title": "Elegir una ventana para cruzar con marea",
    "brief": "Comprueba referencias compatibles, calcula el resguardo mínimo de cada ventana y reevalúa si cambia el margen de incertidumbre.",
    "limitations": "Datum, marea y márgenes son ficticios. El cálculo no autoriza un cruce real ni modela olas, asentamiento dinámico, error de levantamiento o predicciones reales.",
    "stages": {
      "reference": {
        "title": "Comprobar la referencia vertical",
        "brief": "Se ofrecen dos tablas de marea, pero solo una coincide con la carta y el sistema horario.",
        "goal": "Elige datos compatibles antes de combinar alturas.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "chart": {
            "label": "Carta y buque",
            "text": "Profundidad de carta 2,1 m sobre el datum de entrenamiento T. Calado 1,7 m. Horas UTC."
          },
          "tables": {
            "label": "Tablas disponibles",
            "text": "La tabla A usa el datum T y UTC para este lugar y fecha. La B usa otro datum y hora local sin conversión."
          }
        },
        "fields": {
          "table": {
            "label": "Usar esta tabla de marea",
            "options": {
              "A": "Tabla A: datum, lugar, fecha y UTC compatibles",
              "B": "Tabla B: otro datum y hora local sin explicar",
              "either": "Las alturas de ambas tablas son intercambiables"
            }
          },
          "draft": {
            "label": "Anotar el calado",
            "options": {}
          }
        }
      },
      "windows": {
        "title": "Calcular el resguardo mínimo",
        "brief": "Usa la menor altura de marea de cada ventana completa de cruce.",
        "goal": "Calcula ambos resguardos estáticos mínimos y elige la ventana válida.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "tides": {
            "label": "Alturas de la tabla A",
            "text": "09:00: 0,9 m; 10:00: 0,7 m; 11:00: 0,4 m; 12:00: 0,2 m. Se supone descenso monótono entre registros."
          },
          "allowance": {
            "label": "Requisito del ejercicio",
            "text": "El margen total exigido es 0,7 m. Compáralo con profundidad estática menos calado de 1,7 m; la sonda de carta sigue siendo 2,1 m."
          }
        },
        "fields": {
          "earlyClearance": {
            "label": "Resguardo mínimo 09:00–10:00",
            "options": {}
          },
          "lateClearance": {
            "label": "Resguardo mínimo 11:00–12:00",
            "options": {}
          },
          "window": {
            "label": "Ventana que cumple el margen indicado",
            "options": {
              "early": "09:00–10:00",
              "late": "11:00–12:00",
              "both": "Ambas ventanas"
            }
          }
        }
      },
      "uncertainty": {
        "title": "Reevaluar el margen aumentado",
        "brief": "El operador aumenta el margen total tras revisar la incertidumbre.",
        "goal": "Compara la ventana elegida con el nuevo requisito y no la autorices si falla.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "revision": {
            "label": "Margen revisado",
            "text": "Ahora se exigen 1,2 m de margen total. El resguardo estático mínimo de 09:00–10:00 sigue siendo 1,1 m."
          },
          "meaning": {
            "label": "Límite de decisión",
            "text": "Un déficit obliga a buscar mejor ventana o ruta, no a borrar el margen."
          }
        },
        "fields": {
          "shortfall": {
            "label": "Déficit de resguardo",
            "options": {}
          },
          "decision": {
            "label": "Estado revisado del cruce",
            "options": {
              "defer": "No autorizar; buscar ventana o ruta que cumpla el margen",
              "go": "Proceder porque el resguardo es positivo",
              "ignore": "Ignorar la incertidumbre revisada"
            }
          }
        }
      }
    }
  },
  "decision-sail-39": {
    "title": "Resolver una travesía con corriente transversal",
    "brief": "Combina vectores de velocidad, corrige el rumbo y anota el tiempo resultante.",
    "limitations": "Es un ejercicio con vectores constantes, no datos reales de corriente de marea ni garantía de velocidad alcanzable.",
    "stages": {
      "drift": {
        "title": "Calcular el vector sobre el fondo sin corregir",
        "brief": "Inicialmente el yate navega hacia el norte respecto al agua mientras la corriente va al este.",
        "goal": "Calcula rumbo y velocidad sobre el fondo con los dos vectores perpendiculares.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "vectors": {
            "label": "Datos vectoriales",
            "text": "Barco: 5 kn respecto al agua hacia 000°. Corriente: 3 kn hacia 090°. Ignora abatimiento y aceleración en este ejercicio."
          },
          "method": {
            "label": "Método de cálculo",
            "text": "Vector sobre el fondo = velocidad del barco + corriente. Componente norte 5 y este 3. La rapidez es el módulo; la dirección es horaria desde el norte."
          }
        },
        "fields": {
          "groundSpeed": {
            "label": "Velocidad sobre el fondo",
            "options": {}
          },
          "groundCourse": {
            "label": "Rumbo sobre el fondo",
            "options": {}
          }
        }
      },
      "correct": {
        "title": "Gobernar para una derrota norte",
        "brief": "Compensa la corriente al este con una componente del barco al oeste.",
        "goal": "Fija el rumbo noroeste y la velocidad resultante hacia el norte.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "solution": {
            "label": "Componentes necesarias",
            "text": "Mantén 5 kn respecto al agua. Una componente oeste de 3 kn anula la corriente. La componente norte restante es 4 kn."
          },
          "bearing": {
            "label": "Método de demora",
            "text": "El rumbo está al oeste del norte por arcsin(3/5), unos 36,9°. Las demoras son horarias desde el norte."
          }
        },
        "fields": {
          "heading": {
            "label": "Rumbo a gobernar",
            "options": {}
          },
          "groundSpeed": {
            "label": "Velocidad hacia el norte sobre el fondo",
            "options": {}
          }
        }
      },
      "arrival": {
        "title": "Completar el registro corregido de travesía",
        "brief": "Usa la velocidad corregida para un tramo de 8 NM hacia el norte.",
        "goal": "Calcula la duración y conserva los supuestos indicados.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "leg": {
            "label": "Datos del tramo",
            "text": "Distancia 8 NM. Velocidad corregida 4 kn. Salida 10:00 UTC."
          },
          "limits": {
            "label": "Supuestos",
            "text": "Corriente constante, velocidad respecto al agua de 5 kn y sin abatimiento. Deben comprobarse estos supuestos durante un viaje real."
          }
        },
        "fields": {
          "duration": {
            "label": "Duración de travesía",
            "options": {}
          },
          "arrival": {
            "label": "Llegada: horas después de las 10:00",
            "options": {}
          },
          "monitor": {
            "label": "Vigilar durante la navegación",
            "options": {
              "progress": "Avance observado sobre el fondo",
              "current": "Cambios de corriente y viento",
              "never": "No revisar nunca el cálculo"
            }
          }
        }
      }
    }
  },
  "decision-sail-40": {
    "title": "Gestionar una previsión cambiante",
    "brief": "Aprueba un plan inicialmente válido, reconoce un límite rebasado y completa una revisión conservadora.",
    "limitations": "Límites y previsiones son ficticios. Cambiar de ruta aquí no demuestra manejo real con mal tiempo.",
    "stages": {
      "initial": {
        "title": "Comprobar el plan inicial de ruta",
        "brief": "Usa los límites de la tripulación y la ventana de viaje indicada.",
        "goal": "Confirma que todas las condiciones iniciales siguen siendo aceptables.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "limits": {
            "label": "Límites de tripulación y ruta",
            "text": "En este ejercicio: rachas máximas 18 kn, visibilidad mínima 3 NM y ningún tramo expuesto con viento contra corriente."
          },
          "forecast": {
            "label": "Previsión inicial",
            "text": "Durante todo el viaje y reserva: rachas 16 kn, visibilidad 5 NM, viento y corriente en el mismo sentido."
          }
        },
        "fields": {
          "met": {
            "label": "Condiciones que cumplen los límites iniciales",
            "options": {
              "gusts": "Límite de rachas",
              "visibility": "Límite de visibilidad",
              "interaction": "Condición de viento y corriente"
            }
          },
          "status": {
            "label": "Estado inicial del plan",
            "options": {
              "acceptable": "Dentro de los límites indicados, sujeto a comprobaciones continuas",
              "forever": "Aprobado para siempre pese a actualizaciones",
              "impossible": "Solo la aritmética prueba que la ruta es imposible"
            }
          }
        }
      },
      "change": {
        "title": "Identificar los riesgos modificados",
        "brief": "Un nuevo boletín cambia rachas e interacción viento/corriente.",
        "goal": "Anota todos los límites rebasados, no solo el viento medio.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "new": {
            "label": "Previsión actualizada",
            "text": "Las rachas suben a 23 kn. La visibilidad sigue en 5 NM. El viento ahora sopla contra corriente en el tramo expuesto."
          },
          "sea": {
            "label": "Nota de exposición",
            "text": "El viento contra corriente puede hacer la mar más abrupta. Las restricciones anteriores siguen vigentes."
          }
        },
        "fields": {
          "breaches": {
            "label": "Marcar los límites rebasados",
            "options": {
              "gusts": "Límite de rachas",
              "visibility": "Límite de visibilidad",
              "interaction": "Condición de viento y corriente"
            }
          }
        }
      },
      "revise": {
        "title": "Confirmar una revisión completa",
        "brief": "Hay un refugio comprobado accesible antes del tramo expuesto que respeta los límites.",
        "goal": "Desvíate mientras la alternativa sea viable y actualiza el plan.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "alternative": {
            "label": "Informe del refugio",
            "text": "La alternativa evita el tramo expuesto de viento contra corriente y respeta los límites durante la nueva ventana de viaje."
          },
          "reef": {
            "label": "Nota de reducción de vela",
            "text": "Tomar rizos puede ser apropiado, pero no vuelve aceptables por sí solo los límites rebasados de la ruta."
          }
        },
        "fields": {
          "route": {
            "label": "Ruta revisada",
            "options": {
              "shelter": "Usar la alternativa abrigada comprobada",
              "exposed": "Continuar por la ruta expuesta tras tomar rizos",
              "ignore": "Ignorar el boletín"
            }
          },
          "record": {
            "label": "Completar la revisión",
            "options": {
              "crew": "Explicar la nueva ruta y aproximación a la tripulación",
              "eta": "Actualizar destino y llegada estimada",
              "monitor": "Seguir comprobando las condiciones",
              "delete": "Eliminar los límites iniciales"
            }
          }
        }
      }
    }
  },
  "decision-sail-41": {
    "title": "Mantener la evaluación de un contacto no visible",
    "brief": "Registra contactos con visibilidad reducida, elige las reglas adecuadas y no des por resuelto el riesgo antes de tiempo.",
    "limitations": "Evalúa interpretación y planificación de respuesta, no manejo del radar ni maniobras físicas anticolisión.",
    "stages": {
      "risk": {
        "title": "Trazar la tendencia del contacto",
        "brief": "El otro buque se detecta electrónicamente, pero no está a la vista.",
        "goal": "Anota la tendencia y conserva la evaluación de riesgo.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "observations": {
            "label": "Registro de contactos",
            "text": "Minuto 0: demora 070°, distancia 0,8 NM. Minuto 2: demora 070°, distancia 0,5 NM. El buque no se ve visualmente."
          },
          "uncertainty": {
            "label": "Límites de observación",
            "text": "Una sola fuente electrónica no da una imagen completa. En caso de duda, considera que hay riesgo de abordaje."
          }
        },
        "fields": {
          "rangeChange": {
            "label": "Reducción de distancia",
            "options": {}
          },
          "risk": {
            "label": "Estado de riesgo del contacto",
            "options": {
              "present": "Hay riesgo de abordaje",
              "clear": "Paso seguro demostrado",
              "sail": "No hay riesgo si vamos a vela"
            }
          }
        }
      },
      "framework": {
        "title": "Preparar la respuesta con visibilidad reducida",
        "brief": "Usa el contexto internacional indicado para buques que no están a la vista.",
        "goal": "Mantén vigilancia adecuada, velocidad de seguridad y uso correcto de equipos y señales.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "rule": {
            "label": "Marco aplicable",
            "text": "La Regla Internacional 19 trata buques no visibles entre sí dentro o cerca de visibilidad reducida. Siguen las obligaciones generales de vigilancia, velocidad segura y evaluación del riesgo."
          },
          "power": {
            "label": "Condición del buque",
            "text": "En este caso tu yate navega a motor; los motores deben estar listos para maniobrar inmediatamente."
          }
        },
        "fields": {
          "plan": {
            "label": "Confirmar los requisitos de respuesta",
            "options": {
              "lookout": "Mantener vigilancia con medios apropiados disponibles",
              "speed": "Usar una velocidad segura para las condiciones",
              "engines": "Mantener los motores listos para maniobra inmediata",
              "signals": "Usar correctamente las señales y equipos exigidos",
              "priority": "Reclamar prioridad automática de velero"
            }
          }
        }
      },
      "reassess": {
        "title": "Comprobar la observación posterior",
        "brief": "Llega otra observación después de iniciar el plan.",
        "goal": "Mantén abierto el contacto hasta demostrar un paso seguro.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "later": {
            "label": "Informe posterior del contacto",
            "text": "La distancia es ahora 0,3 NM y la demora sigue en 070°. No se ha establecido una distancia de paso segura."
          },
          "action": {
            "label": "Límite de actuación",
            "text": "La maniobra exacta requiere todas las circunstancias y reglas aplicables. No se prescribe aquí un giro universal."
          }
        },
        "fields": {
          "status": {
            "label": "Estado actualizado del contacto",
            "options": {
              "risk": "El riesgo sigue sin resolverse",
              "clear": "Seguro porque se hizo un plan",
              "ignore": "Ignorar hasta verlo"
            }
          },
          "follow": {
            "label": "Seguimiento necesario",
            "options": {
              "continue": "Continuar evaluación y actuaciones oportunas según las reglas",
              "finish": "Terminar la guardia",
              "turn": "Girar siempre igual en todos los encuentros"
            }
          }
        }
      }
    }
  },
  "decision-sail-42": {
    "title": "Contrastar una aproximación nocturna",
    "brief": "Identifica una luz por sus características completas, verifica independencia de sensores y detén la aproximación si las pruebas independientes discrepan.",
    "limitations": "Luces y geometría son ficticias. Evalúa contraste de información, no pilotaje nocturno real ni precisión instrumental.",
    "stages": {
      "identify": {
        "title": "Identificar la luz observada",
        "brief": "Usa la lista de luces del ejercicio, no solo el color.",
        "goal": "Asocia la característica observada con la referencia correcta de la carta.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "observation": {
            "label": "Luz observada",
            "text": "Una luz blanca destella una vez cada 6 segundos."
          },
          "list": {
            "label": "Lista de luces de entrenamiento",
            "text": "A: blanca, un destello cada 3 segundos. B: blanca, uno cada 6 segundos. C: verde, uno cada 6 segundos."
          }
        },
        "fields": {
          "light": {
            "label": "Referencia identificada",
            "options": {
              "A": "Referencia A",
              "B": "Referencia B",
              "C": "Referencia C"
            }
          },
          "features": {
            "label": "Usar ambas características identificativas",
            "options": {
              "color": "Color",
              "period": "Patrón y período de destellos",
              "brightness": "Solo brillo de pantalla"
            }
          }
        }
      },
      "independent": {
        "title": "Elegir comprobaciones independientes",
        "brief": "Dos pantallas electrónicas coinciden porque comparten sensor.",
        "goal": "Elige pruebas que aporten una comprobación independiente.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "sensors": {
            "label": "Conexiones de sensores",
            "text": "Las pantallas 1 y 2 reciben posición del GPS G. Una enfilación visual y la tendencia de profundidad se observan aparte."
          },
          "corrections": {
            "label": "Interpretación de profundidad",
            "text": "Interpreta la tendencia con marea y desplazamiento de sonda conocidos; no es una posición exacta independiente por sí sola."
          }
        },
        "fields": {
          "sources": {
            "label": "Elegir pruebas de contraste independientes",
            "options": {
              "line": "Enfilación visual identificada",
              "depth": "Tendencia de profundidad bien interpretada",
              "duplicate": "Segunda pantalla del receptor GPS G"
            }
          },
          "screens": {
            "label": "Clasificar las posiciones de las dos pantallas",
            "options": {
              "shared": "Dos pantallas de una misma fuente",
              "independent": "Dos posiciones independientes",
              "infallible": "Confirmación sin errores"
            }
          }
        }
      },
      "disagree": {
        "title": "Resolver una aproximación contradictoria",
        "brief": "El plotter indica ruta correcta, pero las observaciones independientes discrepan antes de una entrada estrecha.",
        "goal": "Conserva aguas seguras verificadas y resuelve la discrepancia antes de comprometerte.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "conflict": {
            "label": "Observaciones contradictorias",
            "text": "No aparece la enfilación de luces esperada. La profundidad es menor de lo previsto tras las correcciones conocidas. Ambos GPS muestran la misma derrota."
          },
          "room": {
            "label": "Opción disponible",
            "text": "Hay aguas seguras verificadas y espacio fuera de la entrada. Allí es posible reevaluar con seguridad."
          }
        },
        "fields": {
          "decision": {
            "label": "Decisión de aproximación",
            "options": {
              "hold": "Reducir el riesgo en aguas seguras verificadas y resolver la discrepancia",
              "enter": "Continuar hacia la entrada estrecha para investigar",
              "hide": "Apagar el instrumento que discrepa"
            }
          },
          "review": {
            "label": "Recomprobar antes de continuar",
            "options": {
              "identity": "Identificación y alineación de luces",
              "chart": "Referencia, escala y actualizaciones de carta",
              "depth": "Profundidad, marea y ajustes instrumentales",
              "ignore": "Ignorar observaciones independientes"
            }
          }
        }
      }
    }
  },
  "decision-sail-54": {
    "title": "Lee el mapa antes de salir",
    "brief": "Usa un mapa del tiempo simplificado y un registro del barómetro para valorar el viento en una travesía costera corta.",
    "limitations": "El mapa y las lecturas son datos simplificados del ejercicio, no una previsión. Para travesías reales, usa las previsiones marítimas oficiales.",
    "stages": {
      "direction": {
        "title": "Calcula la dirección del viento",
        "brief": "Hay una baja centrada unas 150 NM al oeste de tu posición, en el hemisferio norte.",
        "goal": "Elige la dirección del viento en tu posición.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "low": {
            "label": "Mapa",
            "text": "La baja está centrada al oeste. Cerca de ti, sus isobaras van más o menos de norte a sur."
          },
          "rule": {
            "label": "Regla práctica",
            "text": "En el hemisferio norte el viento gira alrededor de una baja en sentido antihorario, algo desviado hacia el centro."
          }
        },
        "fields": {
          "windFrom": {
            "label": "El viento sopla del",
            "options": {
              "east": "Este",
              "north": "Norte",
              "south": "Sur",
              "west": "Oeste"
            }
          }
        }
      },
      "spacing": {
        "title": "Compara las isobaras",
        "brief": "El mapa muestra dos zonas a lo largo de tu ruta prevista.",
        "goal": "Identifica dónde será más fuerte el viento.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "north": {
            "label": "Zona norte",
            "text": "Las isobaras, cada 4 hPa, están separadas unas 120 NM."
          },
          "south": {
            "label": "Zona sur",
            "text": "Las isobaras, cada 4 hPa, están separadas unas 30 NM."
          }
        },
        "fields": {
          "stronger": {
            "label": "¿Dónde será más fuerte el viento?",
            "options": {
              "north": "En la zona norte",
              "same": "Igual en las dos",
              "south": "En la zona sur"
            }
          }
        }
      },
      "trend": {
        "title": "Actúa según el barómetro",
        "brief": "Antes de salir, revisas el registro del barómetro.",
        "goal": "Decide si sales y qué anotas.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "log": {
            "label": "Registro del barómetro",
            "text": "06:00 1012 hPa; 09:00 1008 hPa; 12:00 1004 hPa."
          },
          "plan": {
            "label": "Plan de travesía",
            "text": "La travesía dura seis horas por una costa expuesta, sin ningún puerto a mitad de camino."
          }
        },
        "fields": {
          "decision": {
            "label": "Decisión de salida",
            "options": {
              "go": "Salir ya, antes de que empeore",
              "ignore": "Salir: 1004 hPa sigue siendo una lectura normal",
              "wait": "Esperar: la presión baja rápido y el viento va a subir"
            }
          },
          "record": {
            "label": "Anotar en el plan",
            "options": {
              "forecast": "Consultar la última previsión marítima",
              "stop": "Dejar de anotar el barómetro",
              "trend": "La caída de 4 hPa en tres horas"
            }
          }
        }
      }
    }
  },
  "decision-sail-55": {
    "title": "Navega a través de un frente",
    "brief": "Reconoce las fases de una baja frontal y prepara el barco para el frente frío.",
    "limitations": "Un modelo de frente simplificado. Los frentes reales varían en velocidad, fuerza y momento de llegada.",
    "stages": {
      "after": {
        "title": "Después del frente",
        "brief": "La línea de turbonadas ya ha pasado por encima.",
        "goal": "Elige lo que esperas a continuación.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "now": {
            "label": "Condiciones ahora",
            "text": "El viento ha rolado al noroeste y viene con rachas; la visibilidad es muy buena; la presión sube."
          }
        },
        "fields": {
          "expect": {
            "label": "¿Qué esperas a continuación?",
            "options": {
              "drizzle": "Calma inmediata y llovizna cálida",
              "fog": "Niebla espesa el resto del día",
              "showers": "Aire más fresco y despejado, con chubascos con rachas que van amainando"
            }
          }
        }
      },
      "cold": {
        "title": "Prepárate para el frente frío",
        "brief": "Horas después la lluvia ha amainado y la presión se mantiene. Entonces cambia el cielo al oeste.",
        "goal": "Di qué se acerca y prepara el barco.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "pressure": {
            "label": "Barómetro",
            "text": "Estable durante las últimas tres horas."
          },
          "west": {
            "label": "Cielo al oeste",
            "text": "Se acercan cumulonimbos muy altos con una línea oscura de turbonadas."
          }
        },
        "fields": {
          "event": {
            "label": "¿Qué se acerca?",
            "options": {
              "coldFront": "El frente frío",
              "high": "Una alta",
              "warmFront": "Un segundo frente cálido"
            }
          },
          "prepare": {
            "label": "Prepara el barco",
            "options": {
              "hoist": "Izar más vela para llegar antes",
              "metal": "Mantener a la tripulación lejos del mástil y de los herrajes metálicos",
              "reef": "Tomar rizos antes de que llegue la turbonada",
              "stow": "Estibar lo que esté suelto y cerrar las escotillas"
            }
          }
        }
      },
      "sequence": {
        "title": "Ordena las fases del frente",
        "brief": "Una baja frontal cruza tu zona de oeste a este, en el hemisferio norte.",
        "goal": "Ordena lo que vas a encontrar, del primero al último.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "chart": {
            "label": "Mapa",
            "text": "El mapa muestra una baja al noroeste, con un frente cálido delante y un frente frío detrás."
          },
          "sky": {
            "label": "Cielo ahora",
            "text": "Nubes altas y finas se extienden y se van espesando poco a poco desde el oeste."
          }
        },
        "fields": {
          "order": {
            "label": "Orden de llegada",
            "options": {
              "coldFront": "Frente frío",
              "warmFront": "Frente cálido",
              "warmSector": "Sector cálido"
            }
          }
        }
      }
    }
  },
  "decision-sail-56": {
    "title": "Valora el estado de la mar",
    "brief": "Di la fuerza del viento, planifica en torno a la brisa marina y entra en un puerto con mar de fondo.",
    "limitations": "Las cifras de olas y viento son datos del ejercicio. Las entradas reales exigen conocimiento local y las condiciones del momento.",
    "stages": {
      "breeze": {
        "title": "Planifica en torno a la brisa marina",
        "brief": "Un día de verano caluroso y soleado, con viento flojo por la mañana.",
        "goal": "Elige el momento más suave para una salida de un día.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "forecast": {
            "label": "Previsión",
            "text": "La brisa marina aumenta desde media mañana hasta 15–18 nudos por la tarde y se apaga después de la puesta de sol."
          }
        },
        "fields": {
          "when": {
            "label": "¿Cuándo serán más suaves las condiciones?",
            "options": {
              "afternoon": "Salir a las 14:00, con la brisa más fuerte",
              "early": "Salir temprano y volver antes del mediodía",
              "night": "La brisa es más fuerte por la noche"
            }
          }
        }
      },
      "entrance": {
        "title": "Entra con mar de fondo",
        "brief": "Llegas al puerto por la tarde.",
        "goal": "Elige cómo entrar con seguridad.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "sets": {
            "label": "Patrón de las olas",
            "text": "Cada pocos minutos llegan series de olas más grandes, con calmas entre ellas."
          },
          "swell": {
            "label": "Bocana del puerto",
            "text": "Un mar de fondo de 2 m del oeste rompe a ratos en la bocana."
          }
        },
        "fields": {
          "entry": {
            "label": "¿Cómo entras?",
            "options": {
              "anchor": "Fondear en la bocana y esperar",
              "lull": "Esperar fuera, observar las series y entrar en una calma con velocidad para gobernar",
              "now": "Entrar ya directamente, muy despacio"
            }
          },
          "caught": {
            "label": "A mitad de la entrada, el tripulante que vigila a popa avisa de que se forma una nueva serie detrás. ¿Qué haces?",
            "options": {
              "face": "Girar la proa hacia la serie y mantenerte con el motor, y luego seguir entrando tras ella",
              "run": "Reducir y dejar que las olas te lleven dentro",
              "beam": "Ponerte de costado para que las olas pasen por debajo"
            }
          },
          "prepare": {
            "label": "Antes de entrar",
            "options": {
              "crew": "Chalecos puestos y tripulación enganchada",
              "engine": "Motor en marcha y listo",
              "aft": "Un tripulante en la bañera vigilando las olas a popa",
              "foredeck": "Mandar a alguien a la proa a vigilar",
              "hatches": "Escotillas cerradas"
            }
          }
        }
      },
      "force": {
        "title": "Di la fuerza Beaufort",
        "brief": "Compara el instrumento con el mar que te rodea.",
        "goal": "Anota la fuerza Beaufort y compárala con el límite de la tripulación.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "gauge": {
            "label": "Instrumento de viento",
            "text": "25 nudos constantes de viento real."
          },
          "limit": {
            "label": "Límite de la tripulación",
            "text": "En este ejercicio, la tripulación acordó navegar hasta fuerza 5."
          },
          "sea": {
            "label": "Mar",
            "text": "Olas grandes; crestas de espuma blanca por todas partes y algunos rociones."
          }
        },
        "fields": {
          "force": {
            "label": "Fuerza Beaufort",
            "options": {}
          },
          "within": {
            "label": "¿Está dentro del límite de la tripulación?",
            "options": {
              "no": "No",
              "yes": "Sí"
            }
          }
        }
      }
    }
  },
  "decision-sail-57": {
    "title": "Planifica una travesía por el Mediterráneo oriental",
    "brief": "Aplica los patrones meteorológicos de la región a una travesía, una mañana de Sharqiya y un tramo de verano en el Egeo.",
    "limitations": "Los patrones regionales son generales. Usa siempre la previsión marítima oficial vigente para la zona.",
    "stages": {
      "aegean": {
        "title": "Planifica un tramo de verano en el Egeo",
        "brief": "Un chárter en julio por las Cícladas.",
        "goal": "Planifica el próximo tramo según la previsión.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "forecast": {
            "label": "Previsión",
            "text": "Meltemi del norte, fuerza 6 a 7, durante los próximos tres días."
          }
        },
        "fields": {
          "prepare": {
            "label": "Preparación",
            "options": {
              "exposed": "Fondear en el lado norte de las islas",
              "lee": "Fondear en el lado sur de las islas, a su abrigo",
              "reef": "Tomar rizos antes de salir de puerto",
              "shelter": "Elegir puertos abrigados del norte"
            }
          },
          "route": {
            "label": "Próximo tramo",
            "options": {
              "ignore": "Ignorarlo: parará por la tarde",
              "north": "Ceñir hacia el norte por mar abierto a mediodía",
              "south": "Navegar al sur con el viento por popa, en saltos cortos y abrigados"
            }
          }
        }
      },
      "sharqiya": {
        "title": "Interpreta una mañana de Sharqiya",
        "brief": "Una mañana de otoño en un puerto deportivo del norte de Israel.",
        "goal": "Interpreta el agua en calma y elige un plan.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "offshore": {
            "label": "Previsión mar adentro",
            "text": "A diez millas: viento del este fuerza 6 y olas en aumento."
          },
          "wind": {
            "label": "Viento",
            "text": "Sopla desde tierra un viento del este fuerte y seco. Dentro del puerto deportivo y cerca de él, el mar está llano."
          }
        },
        "fields": {
          "meaning": {
            "label": "¿Qué te dice el agua llana cerca de la costa?",
            "options": {
              "calm": "Toda la ruta estará en calma",
              "offshore": "Poco: el viento sopla desde tierra y las olas crecen más lejos",
              "onshore": "El viento sopla hacia la costa"
            }
          },
          "plan": {
            "label": "Tu plan",
            "options": {
              "night": "Salir de noche y esperar que amaine",
              "out": "Alejarse diez millas para una navegación rápida",
              "stay": "Quedarse cerca de la costa, o esperar a que amaine el viento del este"
            }
          }
        }
      },
      "winter": {
        "title": "Planifica la travesía de invierno",
        "brief": "Planeas navegar de Israel a Chipre, unas 24 horas.",
        "goal": "Decide cuándo salir.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "forecast": {
            "label": "Previsión",
            "text": "Una baja sobre Grecia avanza hacia el este, hacia Chipre, en los próximos dos días."
          },
          "pattern": {
            "label": "Patrón",
            "text": "Su frente frío traerá viento fuerte del suroeste al oeste y mar gruesa a lo largo de la ruta."
          }
        },
        "fields": {
          "decision": {
            "label": "Decisión de salida",
            "options": {
              "early": "Salir ya para adelantarse",
              "ignore": "Salir según lo previsto",
              "wait": "Esperar a que pasen la baja y su frente frío"
            }
          }
        }
      }
    }
  },
  "decision-sail-58": {
    "title": "Revisa el equipo de seguridad",
    "brief": "Revisa el equipo de seguridad antes de una salida costera, elige la bengala adecuada y combate un incendio con el extintor correcto.",
    "limitations": "Esto evalúa decisiones a partir de informes proporcionados. No prueba equipos reales, ni el disparo de bengalas ni la extinción de incendios.",
    "stages": {
      "inspect": {
        "title": "Revisa el equipo de seguridad",
        "brief": "Revisas el equipo antes de una salida de un día a lo largo de la costa.",
        "goal": "Elige lo que hay que arreglar antes de salir.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "flares": {
            "label": "Caja de bengalas",
            "text": "Dos cohetes rojos con paracaídas caducaron el año pasado; las bengalas de mano y el humo naranja están en fecha."
          },
          "fire": {
            "label": "Extintores",
            "text": "El manómetro de un extintor de polvo marca en rojo; el del otro marca en verde."
          },
          "harness": {
            "label": "Arneses",
            "text": "Hay un arnés para cada uno de los cuatro tripulantes, y las líneas de vida están montadas."
          }
        },
        "fields": {
          "fix": {
            "label": "Arreglar antes de salir",
            "options": {
              "flares": "Sustituir los cohetes con paracaídas caducados",
              "extinguisher": "Sustituir o revisar el extintor que marca en rojo",
              "harness": "Comprar más arneses",
              "ignore": "Dejarlo como está; solo es una salida de un día"
            }
          }
        }
      },
      "flare": {
        "title": "Elige la bengala adecuada",
        "brief": "Más tarde, el motor ha fallado y necesitas ayuda.",
        "goal": "Relaciona cada situación con la señal adecuada.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "ship": {
            "label": "De noche",
            "text": "Un barco está a unas 6 NM y no ha respondido por radio."
          },
          "helicopter": {
            "label": "De día",
            "text": "Un helicóptero de rescate te está buscando justo encima."
          }
        },
        "fields": {
          "night": {
            "label": "De noche, barco a 6 NM",
            "options": {
              "rocket": "Cohete rojo con paracaídas",
              "smoke": "Humo naranja",
              "hand": "Nada todavía; esperar a que se acerque"
            }
          },
          "day": {
            "label": "De día, helicóptero encima",
            "options": {
              "smoke": "Humo naranja, que además indica el viento",
              "rocket": "Cohete rojo con paracaídas disparado directamente hacia él",
              "none": "Ninguna señal; ya te ha visto"
            }
          }
        }
      },
      "fire": {
        "title": "Combate un incendio en el motor",
        "brief": "Sale humo del compartimento del motor.",
        "goal": "Elige el extintor y las acciones.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "source": {
            "label": "El fuego",
            "text": "Arde gasóleo en el compartimento del motor."
          }
        },
        "fields": {
          "agent": {
            "label": "¿Qué extintor?",
            "options": {
              "powder": "Polvo, o espuma, por una abertura pequeña",
              "water": "Un cubo de agua",
              "open": "Abrir del todo la tapa para ver mejor primero"
            }
          },
          "actions": {
            "label": "Además",
            "options": {
              "engine": "Parar el motor",
              "fuel": "Cortar el combustible",
              "wind": "Girar el barco para que el humo se aleje de la tripulación",
              "hatches": "Abrir todas las escotillas para que entre aire fresco"
            }
          }
        }
      }
    }
  },
  "decision-sail-59": {
    "title": "Abandono del barco",
    "brief": "Prepárate para abandonar un yate que se hunde, adriza una balsa volcada y realiza las primeras acciones a bordo de ella.",
    "limitations": "Esto solo evalúa decisiones a partir de informes proporcionados. Practica con una balsa salvavidas real en un curso de supervivencia en el mar.",
    "stages": {
      "prepare": {
        "title": "Prepárate para abandonar",
        "brief": "El agua sube más rápido de lo que las bombas pueden achicar y la tripulación no encuentra la vía de agua.",
        "goal": "Ordena las acciones.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "status": {
            "label": "Situación",
            "text": "El yate se hundirá en unos veinte minutos. Hace mal tiempo, pero la mar no rompe."
          }
        },
        "fields": {
          "order": {
            "label": "Orden de las acciones",
            "options": {
              "mayday": "Enviar un MAYDAY y una alerta de socorro DSC",
              "dress": "Ponerse el chaleco salvavidas y ropa de abrigo",
              "bag": "Coger la bolsa de abandono",
              "launch": "Atar la boza, lanzar la balsa y subir a ella"
            }
          }
        }
      },
      "right": {
        "title": "Adriza la balsa",
        "brief": "La balsa se ha inflado boca abajo junto al costado.",
        "goal": "Elige cómo adrizarla.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "raft": {
            "label": "La balsa",
            "text": "Sigue atada al yate por su boza. La botella de gas y la cinta de adrizamiento están en su fondo, ahora hacia arriba."
          }
        },
        "fields": {
          "method": {
            "label": "¿Cómo la adrizas?",
            "options": {
              "strap": "Un nadador se pone de pie sobre la botella de gas, agarra la cinta de adrizamiento y se echa hacia atrás, desde el lado de sotavento",
              "deflate": "Desinflarla y volver a inflarla",
              "abandon": "Dejarla y esperar otra balsa"
            }
          }
        }
      },
      "aboard": {
        "title": "Primeras acciones en la balsa",
        "brief": "Todos están a bordo de la balsa.",
        "goal": "Elige las primeras acciones.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "now": {
            "label": "Ahora",
            "text": "La balsa sigue atada al yate que se hunde. Ya se ha pedido rescate; todavía no se ve ningún barco."
          }
        },
        "fields": {
          "actions": {
            "label": "Hacer ahora",
            "options": {
              "cut": "Cortar la boza y alejarse del yate",
              "anchor": "Largar el ancla de capa para quedarse cerca de la posición comunicada",
              "tablets": "Dar a todos pastillas contra el mareo",
              "flares": "Disparar ahora todas las bengalas",
              "seawater": "Beber agua de mar para ahorrar agua dulce"
            }
          }
        }
      }
    }
  },
  "decision-sail-60": {
    "title": "Elige los cabos adecuados",
    "brief": "Elige cabos según su trabajo, cuídalos y calcula la ganancia de un aparejo.",
    "limitations": "Esto evalúa decisiones a partir de la información dada. Los grosores y cargas reales dependen del barco; compruébalos con el fabricante del cabo y con un instructor.",
    "stages": {
      "choose": {
        "title": "Elige el cabo",
        "brief": "Vas a cambiar tres cabos antes de la temporada.",
        "goal": "Elige la mejor fibra para cada trabajo.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "jobs": {
            "label": "Los tres trabajos",
            "text": "Una línea de fondeo y amarre que debe absorber tirones; una driza de mayor que debe mantener la forma de la vela; un cabo de rescate para lanzar que debe flotar."
          }
        },
        "fields": {
          "anchor": {
            "label": "Línea de fondeo y amarre",
            "options": {
              "nylon": "Nailon",
              "polyester": "Poliéster",
              "polypropylene": "Polipropileno"
            }
          },
          "halyard": {
            "label": "Driza de mayor",
            "options": {
              "polyester": "Poliéster",
              "nylon": "Nailon",
              "polypropylene": "Polipropileno"
            }
          },
          "rescue": {
            "label": "Cabo de rescate para lanzar",
            "options": {
              "polypropylene": "Polipropileno",
              "nylon": "Nailon",
              "polyester": "Poliéster"
            }
          }
        }
      },
      "care": {
        "title": "Cuida los cabos",
        "brief": "Tras una semana de travesía revisas los cabos.",
        "goal": "Elige qué hacer.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "salt": {
            "label": "Estado",
            "text": "Los cabos tienen costras de sal. El cabo de amarre de proa está rozado donde pasa por la guía."
          },
          "spare": {
            "label": "Cabos de repuesto",
            "text": "Tienes un cabo de amarre nuevo del grosor adecuado y dos cabos viejos más finos."
          }
        },
        "fields": {
          "actions": {
            "label": "Haz",
            "options": {
              "rinse": "Enjuaga los cabos con agua dulce, sécalos y guárdalos a la sombra",
              "replace": "Cambia el cabo de amarre rozado y protégelo en la guía",
              "double": "Une los dos cabos viejos más finos en lugar del rozado",
              "sun": "Deja los cabos al sol para que se seque la sal"
            }
          }
        }
      },
      "tackle": {
        "title": "Calcula el aparejo",
        "brief": "Levantas la auxiliar de 320 kg con un aparejo colgado del extremo de la botavara.",
        "goal": "Calcula el tiro y la ganancia, sin contar la fricción.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "rig": {
            "label": "El aparejo",
            "text": "Cuatro guarnes de cabo sostienen el motón móvil enganchado a la auxiliar."
          },
          "main": {
            "label": "La escota de mayor",
            "text": "La escota de mayor tiene dos motones dobles, y el cabo sale del motón de la botavara, que es el que se mueve."
          }
        },
        "fields": {
          "pull": {
            "label": "Tiro necesario para levantar la auxiliar",
            "options": {}
          },
          "gain": {
            "label": "Ganancia del aparejo de la escota de mayor",
            "options": {}
          }
        }
      }
    }
  },
  "decision-sail-61": {
    "title": "Llegar a un puerto extranjero",
    "brief": "Lee las banderas del código que te rodean, iza las banderas correctas al llegar y haz bien el despacho de entrada.",
    "limitations": "El significado de las banderas sigue el Código Internacional de Señales. Las normas de entrada varían según el país y cambian; compruébalas antes de cada viaje.",
    "stages": {
      "read": {
        "title": "Lee las banderas que te rodean",
        "brief": "Al acercarte a un puerto extranjero, ves tres buques con banderas sueltas del código.",
        "goal": "Elige la respuesta adecuada para cada uno.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "a": {
            "label": "Primer buque",
            "text": "Una embarcación pequeña con la bandera A, blanca y azul con el extremo en cola de golondrina."
          },
          "b": {
            "label": "Segundo buque",
            "text": "Un petrolero cerca de la bocana con la bandera B, roja y en cola de golondrina."
          },
          "o": {
            "label": "Tercer buque",
            "text": "Un yate con la bandera O, mitad roja y mitad amarilla."
          }
        },
        "fields": {
          "flagA": {
            "label": "Buque con la bandera A",
            "options": {
              "clear": "Mantenerse bien alejado y a poca velocidad: hay buzos sumergidos",
              "help": "Abarloarse para ayudar",
              "ignore": "No hace falta hacer nada"
            }
          },
          "flagB": {
            "label": "Buque con la bandera B",
            "options": {
              "cargo": "Mercancías peligrosas: puedes pasar, pero mantente bien alejado",
              "divers": "Buzos sumergidos",
              "stop": "Detenerse y esperar fuera del puerto"
            }
          },
          "flagO": {
            "label": "Buque con la bandera O",
            "options": {
              "mob": "Hombre al agua: vigila y ofrece ayuda",
              "fuel": "Está cargando combustible",
              "healthy": "Está sano y pide entrar en puerto"
            }
          }
        }
      },
      "hoist": {
        "title": "Iza las banderas de llegada",
        "brief": "Entras por primera vez en aguas del país.",
        "goal": "Elige dónde va cada bandera.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "aboard": {
            "label": "Banderas a bordo",
            "text": "Tu propio pabellón, la bandera del país anfitrión y una bandera Q amarilla."
          }
        },
        "fields": {
          "flags": {
            "label": "Izar",
            "options": {
              "courtesy": "Bandera del país anfitrión bajo la cruceta de estribor",
              "q": "Bandera Q bajo la cruceta de babor hasta el despacho",
              "ensign": "Tu propio pabellón en la popa",
              "replace": "Bandera del país anfitrión en la popa, en lugar de tu pabellón"
            }
          }
        }
      },
      "clear": {
        "title": "Despacha la entrada y sigue navegando",
        "brief": "Aduanas e inmigración te han despachado en el puerto de entrada oficial. Piensas navegar a lo largo de la costa.",
        "goal": "Elige los documentos y las banderas para la travesía.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "papers": {
            "label": "Documentos de entrada",
            "text": "Este país expide a los yates visitantes un transit log en el puerto de entrada."
          }
        },
        "fields": {
          "log": {
            "label": "¿Qué permite el transit log?",
            "options": {
              "free": "Navegar libremente por las aguas costeras del país",
              "fishing": "La pesca comercial",
              "nothing": "Nada; es solo un recuerdo"
            }
          },
          "after": {
            "label": "Después del despacho de entrada",
            "options": {
              "lowerQ": "Arriar la bandera Q",
              "courtesy": "Mantener izada la bandera de cortesía en estas aguas",
              "ensign": "Arriar tu propio pabellón"
            }
          }
        }
      }
    }
  },
  "decision-sail-62": {
    "title": "Resolver averías del equipo",
    "brief": "Afronta una avería del gobierno, un obenque roto y un remolque a partir de los informes proporcionados.",
    "limitations": "Evalúa decisiones a partir de los informes proporcionados. Practica a montar la caña de emergencia y a preparar un remolque con un instructor.",
    "stages": {
      "steering": {
        "title": "Te quedas sin gobierno",
        "brief": "Entrando a motor en una marina, la rueda de repente gira en vacío y el barco no responde.",
        "goal": "Elige qué hacer.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "check": {
            "label": "Comprobación",
            "text": "El guardín se ha partido. El timón en sí no tiene daños. El rompeolas está 150 m por delante."
          }
        },
        "fields": {
          "fix": {
            "label": "Tu acción",
            "options": {
              "tiller": "Montar la caña de emergencia en la mecha del timón",
              "engine": "Gobernar solo con el motor y seguir entrando",
              "anchor": "Fondear en la bocana"
            }
          },
          "also": {
            "label": "Además",
            "options": {
              "slow": "Reducir la velocidad y mantenerse alejado del rompeolas",
              "call": "Avisar a la marina y pedir ayuda pronto",
              "speed": "Acelerar para entrar antes de que empeore"
            }
          }
        }
      },
      "shroud": {
        "title": "Se rompe un obenque",
        "brief": "Navegas a rumbo 150° con viento del suroeste de fuerza 5.",
        "goal": "Averigua qué obenque está cargado y actúa.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "wind": {
            "label": "Viento y amura",
            "text": "El viento sopla del suroeste, así que entra por tu costado de estribor: navegas amurado a estribor."
          },
          "break": {
            "label": "Daño",
            "text": "Un obenque cargado acaba de romperse con un chasquido."
          }
        },
        "fields": {
          "side": {
            "label": "¿Qué obenque soportaba la carga?",
            "options": {
              "starboard": "El obenque de estribor",
              "port": "El obenque de babor",
              "backstay": "El backstay"
            }
          },
          "act": {
            "label": "Primera acción",
            "options": {
              "tack": "Virar enseguida para que el costado roto quede a sotavento",
              "hold": "Mantener el rumbo y cazar el backstay",
              "later": "Seguir navegando y arriar las velas más tarde"
            }
          }
        }
      },
      "tow": {
        "title": "Toma un barco a remolque",
        "brief": "Un yate de 10 m con avería de motor pide un remolque. Hay una mar de unos 2 m.",
        "goal": "Elige el cabo y los preparativos.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "lines": {
            "label": "Cabos a bordo",
            "text": "Un cabo de nailon grueso de 50 m, una escota de poliéster de 10 m y 10 m de cadena."
          },
          "boats": {
            "label": "Barcos",
            "text": "Los dos barcos tienen cornamusas fuertes en proa y popa."
          }
        },
        "fields": {
          "line": {
            "label": "Cabo de remolque",
            "options": {
              "long": "El cabo de nailon grueso de 50 m",
              "short": "La escota de poliéster de 10 m",
              "chain": "Los 10 m de cadena"
            }
          },
          "prepare": {
            "label": "Preparativos",
            "options": {
              "fuel": "Comprobar que tienes combustible para la carga adicional",
              "points": "Usar puntos fuertes o una brida en ambos barcos",
              "signals": "Acordar señales con la otra tripulación",
              "fast": "Remolcar a toda máquina para llegar antes"
            }
          }
        }
      }
    }
  },
  "decision-sail-63": {
    "title": "Sitúa posiciones en la carta",
    "brief": "Escribe posiciones, mide en la escala correcta y lee los símbolos de la carta para planificar una travesía.",
    "limitations": "Esto evalúa la lectura de la carta solo a partir de la información dada. Practica en una carta real con compás de puntas y transportador.",
    "stages": {
      "grid": {
        "title": "Escribe la posición",
        "brief": "Lees tu posición en la carta para comunicarla por radio.",
        "goal": "Elige la forma correcta de escribirla y medirla.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "chart": {
            "label": "En la carta",
            "text": "El barco está a 32 grados 05 minutos norte y 34 grados 46 minutos este. La carta es una carta Mercator."
          }
        },
        "fields": {
          "write": {
            "label": "¿Cómo la escribes?",
            "options": {
              "latlon": "32°05′ N, 034°46′ E",
              "lonlat": "034°46′ N, 32°05′ E",
              "degrees": "32° N, 34° E"
            }
          },
          "scale": {
            "label": "¿Dónde mides las distancias?",
            "options": {
              "lat": "En la escala de latitud del lateral, a la altura del barco",
              "lon": "En la escala de longitud de arriba",
              "any": "En cualquier escala de la carta"
            }
          }
        }
      },
      "from": {
        "title": "Posición desde un faro",
        "brief": "El faro es tu referencia.",
        "goal": "Elige dónde está el barco.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "report": {
            "label": "Comunicación",
            "text": "«El barco está a 180° desde el faro, 3 NM»."
          }
        },
        "fields": {
          "where": {
            "label": "¿Dónde está el barco?",
            "options": {
              "south": "3 NM al sur del faro",
              "north": "3 NM al norte del faro",
              "west": "3 NM al oeste del faro"
            }
          }
        }
      },
      "symbols": {
        "title": "Lee la carta",
        "brief": "Piensas fondear y pasar una luz por el camino.",
        "goal": "Lee los símbolos.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "light": {
            "label": "Luz",
            "text": "La carta muestra «Fl(2) 6s 12m 9M»."
          },
          "bottom": {
            "label": "Fondo",
            "text": "El fondeadero está marcado «S» y las rocas cercanas «R»."
          }
        },
        "fields": {
          "range": {
            "label": "Alcance nominal de la luz",
            "options": {}
          },
          "anchor": {
            "label": "¿Dónde fondeas?",
            "options": {
              "sand": "En la arena (S)",
              "rock": "En la roca (R)",
              "either": "En cualquiera; el fondo no importa"
            }
          },
          "update": {
            "label": "¿Cómo sabes que la carta está actualizada?",
            "options": {
              "notices": "Compruebo las correcciones con los últimos Avisos a los Navegantes",
              "date": "Basta con la fecha de impresión",
              "never": "Las cartas nunca cambian"
            }
          }
        }
      }
    }
  },
  "decision-sail-64": {
    "title": "Convierte el compás",
    "brief": "Convierte rumbos y demoras entre compás, magnético y verdadero, y comprueba el compás en una enfilación.",
    "limitations": "Esto evalúa solo la aritmética del compás. El desvío real debe medirse en tu propio barco.",
    "stages": {
      "variation": {
        "title": "Actualiza la declinación",
        "brief": "La rosa de la carta muestra «3°30′ E 2015 (8′ E)». Este año es 2025.",
        "goal": "Calcula la declinación de este año.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "rose": {
            "label": "Rosa de la carta",
            "text": "Declinación 3°30′ E en 2015, que aumenta 8′ E cada año."
          }
        },
        "fields": {
          "var": {
            "label": "Declinación de este año, redondeada al grado este más cercano",
            "options": {}
          }
        }
      },
      "course": {
        "title": "Del rumbo al compás",
        "brief": "Debes hacer 213° V. La declinación es 5° E. La tablilla de desvíos da 2° W a este rumbo.",
        "goal": "Calcula el rumbo de compás.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "card": {
            "label": "Tablilla de desvíos",
            "text": "A rumbos cercanos a 210°, el desvío es 2° W."
          }
        },
        "fields": {
          "magnetic": {
            "label": "Rumbo magnético",
            "options": {}
          },
          "compass": {
            "label": "Rumbo de compás a gobernar",
            "options": {}
          }
        }
      },
      "transit": {
        "title": "Comprueba en una enfilación",
        "brief": "Cruzas una enfilación que en la carta es 076° V. La declinación es 5° E.",
        "goal": "Calcula el desvío.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "reading": {
            "label": "Compás",
            "text": "Cuando las dos marcas se ponen en línea, el compás de gobierno marca 074°."
          }
        },
        "fields": {
          "dev": {
            "label": "Desvío a este rumbo",
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
    "title": "Sitúa el barco",
    "brief": "Elige objetos para una buena situación, toma las demoras en el orden correcto y decide qué hacer con un triángulo de error.",
    "limitations": "Esto evalúa decisiones de trazado a partir de observaciones dadas. Practica tomando demoras reales con un compás de marcación de mano.",
    "stages": {
      "choose": {
        "title": "Elige los objetos",
        "brief": "Hay cuatro objetos de la carta a la vista.",
        "goal": "Elige los tres mejores para una situación.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "objects": {
            "label": "Objetos",
            "text": "Un faro por la proa, una torre de iglesia de través, una antena de radio a solo 10° del faro y un cabo por la popa."
          }
        },
        "fields": {
          "pick": {
            "label": "Usa",
            "options": {
              "light": "El faro por la proa",
              "church": "La torre de iglesia de través",
              "headland": "El cabo por la popa",
              "mast": "La antena de radio a 10° del faro"
            }
          }
        }
      },
      "order": {
        "title": "Toma las demoras",
        "brief": "Tomas las tres demoras una tras otra.",
        "goal": "Elige cuál tomar al final.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "speed": {
            "label": "Barco",
            "text": "Vas a 6 nudos con un rumbo constante."
          }
        },
        "fields": {
          "last": {
            "label": "¿Qué demora va al final?",
            "options": {
              "abeam": "La torre de iglesia de través",
              "ahead": "El faro por la proa",
              "astern": "El cabo por la popa"
            }
          }
        }
      },
      "hat": {
        "title": "Traza la situación",
        "brief": "Las tres líneas forman un pequeño triángulo. Hay un arrecife al este.",
        "goal": "Elige tu posición y la siguiente comprobación.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "triangle": {
            "label": "Triángulo de error",
            "text": "El triángulo mide 0,2 NM de lado a lado; su vértice este es el más cercano al arrecife."
          }
        },
        "fields": {
          "use": {
            "label": "Posición que usas",
            "options": {
              "danger": "El vértice más cercano al arrecife",
              "centre": "El centro",
              "far": "El vértice más alejado del arrecife"
            }
          },
          "next": {
            "label": "Después",
            "options": {
              "log": "Anotar la hora, la lectura de la corredera y la situación en el cuaderno de bitácora",
              "gps": "Compararla con el GPS",
              "ignore": "Dejar de comprobar; la situación es exacta"
            }
          }
        }
      }
    }
  },
  "decision-sail-66": {
    "title": "Pasa el cabo",
    "brief": "Calcula dónde aparecerá una luz, planifica una distancia de paso y compruébala con el ángulo por la proa.",
    "limitations": "Esto evalúa la planificación de la travesía con cifras dadas. La visibilidad real, la refracción y la corriente cambian los resultados.",
    "stages": {
      "rise": {
        "title": "¿Cuándo se verá la luz?",
        "brief": "Te acercas a la costa de noche.",
        "goal": "Calcula las distancias.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "light": {
            "label": "Luz",
            "text": "El faro tiene 49 m de altura y un alcance nominal de 20M."
          },
          "eye": {
            "label": "Tú",
            "text": "Tu ojo está a 2,5 m sobre el agua."
          }
        },
        "fields": {
          "geo": {
            "label": "Distancia a la que la luz puede aparecer sobre el horizonte (2,08 × (√49 + √2,5))",
            "options": {}
          }
        }
      },
      "clear": {
        "title": "Planifica la demora de seguridad",
        "brief": "Un arrecife sale del cabo. Quieres mantenerte alejado de él.",
        "goal": "Elige cómo mantenerte alejado.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "line": {
            "label": "Carta",
            "text": "La línea desde el faro que pasa por el borde exterior del arrecife es 040° V. El agua segura está donde la demora es mayor que 040°."
          }
        },
        "fields": {
          "rule": {
            "label": "¿Qué escribes en la carta?",
            "options": {
              "nlt": "No menos de 040°",
              "nmt": "No más de 040°",
              "exact": "Exactamente 040°"
            }
          },
          "reading": {
            "label": "El faro demora ahora 036° V. ¿Qué haces?",
            "options": {
              "away": "Me aparto del arrecife hasta que la demora pase de 040°",
              "hold": "Mantengo el rumbo",
              "closer": "Me acerco al arrecife"
            }
          }
        }
      },
      "double": {
        "title": "Comprueba la distancia de paso",
        "brief": "Navegas a 5 nudos con un rumbo constante.",
        "goal": "Calcula tu distancia al faro.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "angles": {
            "label": "Ángulos",
            "text": "El faro está a 45° por la proa a las 21:00 y de través (90°) a las 21:36."
          }
        },
        "fields": {
          "off": {
            "label": "Distancia al faro cuando está de través",
            "options": {}
          }
        }
      }
    }
  },
  "decision-sail-67": {
    "title": "Corrige la corriente y el abatimiento",
    "brief": "Resuelve el triángulo del rumbo a gobernar, corrige el abatimiento y calcula el tiempo de travesía.",
    "limitations": "Esto evalúa el trabajo con vectores en la carta con una corriente constante y dada. Las corrientes reales cambian con el tiempo y el lugar.",
    "stages": {
      "triangle": {
        "title": "Dibuja el triángulo",
        "brief": "Quieres hacer 000° V hacia un puerto 12 NM al norte.",
        "goal": "Resuelve el rumbo a gobernar.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "current": {
            "label": "Corriente",
            "text": "La corriente lleva rumbo 090° a 2 nudos."
          },
          "boat": {
            "label": "Barco",
            "text": "Navegas a 5 nudos en el agua."
          }
        },
        "fields": {
          "steer": {
            "label": "Rumbo a gobernar (verdadero)",
            "options": {}
          },
          "sog": {
            "label": "Velocidad sobre el fondo",
            "options": {}
          }
        }
      },
      "leeway": {
        "title": "Corrige el abatimiento",
        "brief": "El viento es del oeste y estimas 4° de abatimiento.",
        "goal": "Elige el rumbo corregido.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "wind": {
            "label": "Viento",
            "text": "Viento del oeste; el barco se desliza hacia el este."
          }
        },
        "fields": {
          "final": {
            "label": "Rumbo a gobernar tras el abatimiento (verdadero)",
            "options": {}
          }
        }
      },
      "time": {
        "title": "Calcula el tiempo",
        "brief": "Sales a las 10:00.",
        "goal": "Calcula el tiempo de travesía.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "leg": {
            "label": "Tramo",
            "text": "12 NM a la velocidad sobre el fondo que has hallado."
          }
        },
        "fields": {
          "hours": {
            "label": "Tiempo de travesía",
            "options": {}
          },
          "check": {
            "label": "Por el camino",
            "options": {
              "fix": "Obtengo la situación con regularidad y corrijo el rumbo",
              "trust": "Me fío del triángulo y no compruebo nada",
              "straight": "Gobierno directamente al puerto"
            }
          }
        }
      }
    }
  },
  "decision-sail-68": {
    "title": "Planifica con el reloj y la marea",
    "brief": "Convierte las horas de la previsión, elige una ventana de marea y estima la altura con la regla de los doceavos.",
    "limitations": "Esto evalúa la aritmética de mareas y horas con tablas ficticias. Usa tablas oficiales y deja un margen de seguridad.",
    "stages": {
      "time": {
        "title": "Convierte la previsión",
        "brief": "La previsión marítima avisa de un cambio de viento a las 12:00 UTC. Es verano en Israel.",
        "goal": "Convierte la hora.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "zone": {
            "label": "Huso horario",
            "text": "La hora de verano de Israel es UTC+3."
          }
        },
        "fields": {
          "local": {
            "label": "Hora local del cambio de viento",
            "options": {}
          }
        }
      },
      "height": {
        "title": "Altura de la marea",
        "brief": "Necesitas cruzar un bajo en el golfo de Eilat.",
        "goal": "Estima la altura de la marea.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "table": {
            "label": "Tabla de mareas",
            "text": "Bajamar de 0,3 m a las 08:00, pleamar de 1,5 m a las 14:00."
          }
        },
        "fields": {
          "h10": {
            "label": "Altura de la marea a las 10:00",
            "options": {}
          },
          "h11": {
            "label": "Altura de la marea a las 11:00",
            "options": {}
          }
        }
      },
      "depth": {
        "title": "Profundidad sobre el bajo",
        "brief": "El bajo aparece en la carta con una altura de secado de 0,2 m (subrayada).",
        "goal": "Calcula la profundidad.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "crossing": {
            "label": "Plan",
            "text": "Piensas cruzar a las 11:00. Tu calado es de 1,8 m."
          }
        },
        "fields": {
          "depth": {
            "label": "Profundidad sobre el bajo a las 11:00",
            "options": {}
          },
          "go": {
            "label": "¿Puedes cruzar?",
            "options": {
              "no": "No; la profundidad es menor que el calado",
              "yes": "Sí; la marea está subiendo"
            }
          }
        }
      }
    }
  },
  "decision-sail-69": {
    "title": "Elige las velas",
    "brief": "Elige el plan de velas para la previsión y corrige el timón ardiente equilibrando las velas.",
    "limitations": "Esto evalúa la elección de velas a partir de los informes dados. Practica izar las velas de tormenta en puerto con un instructor.",
    "stages": {
      "light": {
        "title": "Una mañana de viento flojo",
        "brief": "La previsión es de 6 a 8 nudos del oeste, y navegas en popa.",
        "goal": "Elige el plan de velas.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "crew": {
            "label": "Tripulación",
            "text": "Dos tripulantes con experiencia y tú."
          }
        },
        "fields": {
          "plan": {
            "label": "Plan de velas",
            "options": {
              "gennaker": "Mayor completa y el gennaker",
              "storm": "Tormentín y vela de capa",
              "reefed": "Dos rizos y el foque"
            }
          }
        }
      },
      "helm": {
        "title": "Timón duro",
        "brief": "A mediodía el viento es de 20 nudos en un descuartelar. El barco escora mucho y el timón tira con fuerza hacia el viento.",
        "goal": "Elige qué hacer.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "feel": {
            "label": "Al timón",
            "text": "El timón va muy metido solo para mantener el rumbo."
          }
        },
        "fields": {
          "fix": {
            "label": "Haz",
            "options": {
              "reef": "Toma rizos en la mayor",
              "traveler": "Baja el carro a sotavento",
              "genoa": "Enrolla algo de génova para que siga equilibrada con la mayor rizada",
              "harder": "Caza más la escota de la mayor"
            }
          }
        }
      },
      "storm": {
        "title": "Aviso de temporal",
        "brief": "Se prevé un temporal para la noche y no puedes llegar a un refugio.",
        "goal": "Elige el plan de velas de tormenta.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "aboard": {
            "label": "Velas a bordo",
            "text": "Mayor con tres rizos, génova enrollable, tormentín, vela de capa."
          }
        },
        "fields": {
          "plan": {
            "label": "Plan de velas para el temporal",
            "options": {
              "storm": "Tormentín y vela de capa",
              "genoa": "Un tercio de la génova desenrollado y la mayor completa",
              "none": "Ninguna vela, atravesado a las olas"
            }
          }
        }
      }
    }
  },
  "decision-sail-70": {
    "title": "Mantén el barco estable",
    "brief": "Estiba la carga, ocúpate del agua suelta y juzga cuándo el barco se ha vuelto blando.",
    "limitations": "Esto evalúa solo el razonamiento sobre estabilidad. Los datos de estabilidad y los límites de carga de tu barco están en su documentación.",
    "stages": {
      "stow": {
        "title": "Estiba la carga",
        "brief": "Cargas el barco para una semana de crucero.",
        "goal": "Elige dónde va cada cosa.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "load": {
            "label": "Carga",
            "text": "Ancla y cadena de repuesto, 100 litros de agua en garrafas, una auxiliar inflada con fueraborda."
          }
        },
        "fields": {
          "stow": {
            "label": "Haz",
            "options": {
              "low": "Estiba el ancla, la cadena y el agua abajo y cerca del centro",
              "dinghy": "Remolca o desinfla la auxiliar en lugar de llevarla inflada en la proa",
              "deck": "Trinca las garrafas de agua sobre el techo de la cámara"
            }
          }
        }
      },
      "free": {
        "title": "Agua abajo",
        "brief": "Con mal tiempo, el barco de repente se nota blando y se balancea despacio.",
        "goal": "Elige qué hacer.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "bilge": {
            "label": "Sentina",
            "text": "Encuentras 20 cm de agua moviéndose en la sentina, y el tanque de combustible está a medias."
          }
        },
        "fields": {
          "act": {
            "label": "Haz",
            "options": {
              "pump": "Achica la sentina y busca por dónde entra el agua",
              "close": "Cierra las escotillas y las tablas de la entrada",
              "ignore": "Ignóralo; un poco de agua no importa"
            }
          }
        }
      },
      "limit": {
        "title": "¿Cuánto puede escorar?",
        "brief": "La tripulación pregunta si el velero puede volcar.",
        "goal": "Elige la respuesta correcta.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "boat": {
            "label": "Barco",
            "text": "Un monocasco de quilla profunda."
          }
        },
        "fields": {
          "answer": {
            "label": "¿Qué es cierto?",
            "options": {
              "lever": "El brazo adrizante crece con la escora y después baja a cero con un ángulo grande; más allá, el barco vuelca",
              "never": "Un barco de quilla nunca puede volcar",
              "cat": "Es tan estable como un catamarán a cualquier ángulo"
            }
          }
        }
      }
    }
  },
  "decision-sail-71": {
    "title": "Aguanta un temporal",
    "brief": "Prepara el barco y la tripulación para el mal tiempo, ponte al pairo y elige una táctica de temporal.",
    "limitations": "Esto evalúa decisiones de mal tiempo a partir de los informes dados. Practica ponerte al pairo con un instructor y viento moderado.",
    "stages": {
      "prepare": {
        "title": "Antes de que suba el viento",
        "brief": "Se prevé un temporal dentro de seis horas y el puerto seguro más cercano está demasiado lejos.",
        "goal": "Elige los preparativos.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "now": {
            "label": "Ahora",
            "text": "Viento de 15 nudos y subiendo; la tripulación está descansada."
          }
        },
        "fields": {
          "do": {
            "label": "Haz ahora",
            "options": {
              "stow": "Estiba y trinca todo abajo y en cubierta",
              "jacklines": "Monta las líneas de vida y que todos se pongan el arnés",
              "food": "Cocina una comida caliente y llena los termos",
              "reef": "Toma rizos pronto y ten listo el tormentín",
              "wait": "Espera a que el viento sea fuerte antes de hacer nada"
            }
          }
        }
      },
      "heave": {
        "title": "Ponte al pairo",
        "brief": "Necesitas que la tripulación descanse y tomar el tercer rizo.",
        "goal": "Elige cómo detener el barco.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "sails": {
            "label": "Velas",
            "text": "Llevas izados la mayor con rizos y el tormentín."
          }
        },
        "fields": {
          "how": {
            "label": "¿Cómo te pones al pairo?",
            "options": {
              "back": "Vira por avante dejando el foque acuartelado, larga la mayor y trinca el timón para llevar la proa hacia el viento",
              "drop": "Arría todas las velas",
              "run": "Arriba y corre deprisa"
            }
          }
        }
      },
      "tactic": {
        "title": "Mar rompiente",
        "brief": "Las olas ya rompen y el barco surfea peligrosamente en popa.",
        "goal": "Elige la táctica.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "room": {
            "label": "Espacio en el mar",
            "text": "Tienes 40 NM de aguas abiertas a sotavento."
          }
        },
        "fields": {
          "tactic": {
            "label": "Táctica",
            "options": {
              "drogue": "Corre a palo seco o con el tormentín, remolcando un drogue por la popa",
              "beam": "Arría todas las velas y quédate atravesado",
              "fast": "Corre deprisa con todo el trapo"
            }
          }
        }
      }
    }
  },
  "decision-sail-72": {
    "title": "Lleva la guardia nocturna",
    "brief": "Releva una guardia, decide cuándo llamar al patrón y organiza una guardia de fondeo.",
    "limitations": "Esto evalúa decisiones de guardia a partir de los informes dados.",
    "stages": {
      "handover": {
        "title": "Recibe la guardia",
        "brief": "Son las 02:00 y subes a hacer la guardia.",
        "goal": "Elige qué debe incluir el relevo.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "deck": {
            "label": "En cubierta",
            "text": "La guardia saliente dice «todo bien» y empieza a bajar."
          }
        },
        "fields": {
          "cover": {
            "label": "Pregunta por",
            "options": {
              "position": "Rumbo y posición",
              "traffic": "Buques a la vista",
              "weather": "Tiempo y barómetro",
              "orders": "Las órdenes del patrón",
              "nothing": "Nada; «todo bien» basta"
            }
          }
        }
      },
      "call": {
        "title": "¿Llamar al patrón?",
        "brief": "A las 03:10 las luces de un buque se acercan con demora constante.",
        "goal": "Decide.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "orders": {
            "label": "Órdenes permanentes",
            "text": "Llama al patrón ante cualquier buque que se acerque con demora constante, cualquier cambio del tiempo o cualquier duda."
          }
        },
        "fields": {
          "act": {
            "label": "¿Qué haces?",
            "options": {
              "call": "Llamo al patrón ahora",
              "wait": "Espero a que esté muy cerca",
              "log": "Solo lo anoto en el cuaderno"
            }
          }
        }
      },
      "anchor": {
        "title": "Fondea para la noche",
        "brief": "Fondeas en una bahía y el viento puede rolar después de medianoche.",
        "goal": "Organiza la guardia de fondeo.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "bay": {
            "label": "Bahía",
            "text": "Se ven un faro y un espigón; el GPS tiene alarma de fondeo."
          }
        },
        "fields": {
          "set": {
            "label": "Prepara",
            "options": {
              "bearings": "Toma demoras del faro y del espigón",
              "alarm": "Activa la alarma de fondeo del GPS",
              "light": "Enciende la luz de fondeo",
              "sleep": "Que duerman todos; las anclas nunca garrean"
            }
          }
        }
      }
    }
  },
  "decision-sail-73": {
    "title": "Actúa como patrón",
    "brief": "Cumple los deberes del patrón: documentación, una llamada de socorro, avisos y medio ambiente.",
    "limitations": "Esto evalúa deberes generales. Comprueba la normativa vigente de tu país antes de navegar.",
    "stages": {
      "papers": {
        "title": "Revisa la documentación",
        "brief": "Antes de una salida costera revisas la documentación del barco.",
        "goal": "Elige lo que debe estar a bordo y en vigor.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "folder": {
            "label": "Carpeta",
            "text": "Licencia, certificado de navegabilidad, póliza de seguro, tu título, un recibo antiguo de la marina."
          }
        },
        "fields": {
          "papers": {
            "label": "Debe estar en vigor y a bordo",
            "options": {
              "licence": "La licencia del barco",
              "seaworthy": "El certificado de navegabilidad",
              "insurance": "La póliza de seguro",
              "skipper": "Tu título de patrón"
            }
          }
        }
      },
      "distress": {
        "title": "Una llamada de socorro",
        "brief": "En travesía oyes un Mayday de un velero a 5 NM. La mar está moderada.",
        "goal": "Elige qué haces.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "you": {
            "label": "Tu barco",
            "text": "Estás bien preparado y puedes llegar hasta él en una hora."
          }
        },
        "fields": {
          "act": {
            "label": "Haz",
            "options": {
              "help": "Dirígete a ayudar si es seguro",
              "reply": "Responde a la llamada y da tu posición y el tiempo que tardarás en llegar",
              "log": "Anótalo en el cuaderno de bitácora",
              "ignore": "Sigue tu camino; ya irá otro"
            }
          }
        }
      },
      "rules": {
        "title": "Planifica el día",
        "brief": "Unos amigos se ofrecen a pagarte para que los lleves a una reserva natural.",
        "goal": "Elige lo correcto.",
        "success": "Etapa superada. El plan confirmado se mantiene en la siguiente etapa.",
        "retry": "Revisa la información y corrige la tarea resaltada. Esta etapa aún no está superada.",
        "facts": {
          "notice": {
            "label": "Aviso a los Navegantes",
            "text": "Mañana hay ejercicios de tiro en una zona de tu ruta."
          },
          "reserve": {
            "label": "Reserva",
            "text": "En la reserva está prohibido fondear sobre las praderas marinas."
          }
        },
        "fields": {
          "pay": {
            "label": "¿Puedes llevarlos cobrando?",
            "options": {
              "no": "No; los pasajeros que pagan exigen una licencia especial",
              "yes": "Sí, con una licencia privada"
            }
          },
          "plan": {
            "label": "Plan",
            "options": {
              "avoid": "Rodear la zona de tiro",
              "sand": "Fondear solo en arena",
              "rubbish": "Traer toda la basura de vuelta a puerto",
              "seagrass": "Fondear sobre las praderas marinas porque agarran bien"
            }
          }
        }
      }
    }
  },
};
