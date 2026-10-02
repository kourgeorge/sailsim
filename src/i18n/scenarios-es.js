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
  }
};
