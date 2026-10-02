// Text only: canonical scenario geometry and grading remain in the course.
export default {
  'decision-sail-46': {
    title: 'Encuentros a vela: amura, barlovento y alcance',
    brief: 'Inspecciona el diagrama y el informe antes de responder.',
    limitations:
      'Estudia las reglas internacionales del RIPA citadas y las aplicables a tus aguas. Practica con un instructor; los diagramas evalúan el razonamiento, no la competencia real para evitar abordajes.',
    stages: {
      opposite: {
        title: 'Amuras distintas',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Amuras distintas',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Reglas internacionales, a la vista, aguas abiertas, riesgo, sin estado especial ni alcance. Eres A, amurado a babor; B va a estribor.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'A se aparta; ambos vigilan',
              'choice-1': 'B se aparta por estar a la derecha del dibujo',
              'choice-2': 'Ninguno tiene obligaciones',
            },
          },
        },
      },
      same: {
        title: 'Cambia de punto de vista',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Cambia de punto de vista',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Ahora eres B, el velero de sotavento. A está a barlovento; ambos a estribor, con riesgo y sin alcance. A actúa pronto y correctamente.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Cambiar rumbo de forma imprevisible',
              'choice-1': 'Mantener al principio rumbo y velocidad, vigilando',
              'choice-2': 'Dejar de vigilar',
            },
          },
        },
      },
      overtake: {
        title: 'El alcance prevalece',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'El alcance prevalece',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Eres A, velero que se acerca al motor B desde 30° a popa de su través, a la vista. Llegas al costado sin quedar aún pasado y franco.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'B debe ceder ahora a la vela',
              'choice-1': 'La obligación terminó al través',
              'choice-2': 'A sigue apartado hasta quedar pasado y franco',
            },
          },
        },
      },
    },
  },
  'decision-sail-47': {
    title: 'A motor: vuelta encontrada, cruce y encuentros mixtos',
    brief: 'Inspecciona el diagrama y el informe antes de responder.',
    limitations:
      'Estudia las reglas internacionales del RIPA citadas y las aplicables a tus aguas. Practica con un instructor; los diagramas evalúan el razonamiento, no la competencia real para evitar abordajes.',
    stages: {
      crossing: {
        title: 'Cruce a motor',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Cruce a motor',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Eres A rumbo norte, propulsado por motor con velas izadas. B es un motor ordinario por tu estribor. A la vista, riesgo de cruce en aguas abiertas, sin alcance.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'A cede y evita cortar la proa si es posible',
              'choice-1': 'A tiene prioridad de vela',
              'choice-2': 'B cede porque A es mayor',
            },
          },
        },
      },
      reverse: {
        title: 'El mismo cruce desde B',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'El mismo cruce desde B',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Ahora eres B en el mismo cruce. A está por babor y actúa pronto y correctamente. No hay estado especial ni restricción local.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Girar siempre a babor',
              'choice-1': 'Mantener inicialmente rumbo y velocidad y vigilar a A',
              'choice-2': 'Ignorar a A porque cede',
            },
          },
        },
      },
      'head-on': {
        title: 'Vuelta encontrada en el siguiente tramo',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Vuelta encontrada en el siguiente tramo',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Dos motores ordinarios se acercan en rumbos casi opuestos con riesgo, a la vista y en aguas abiertas. Sin alcance ni condición especial.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Solo gira A',
              'choice-1': 'Ambos giran a babor',
              'choice-2': 'Ambos a estribor para pasar babor con babor',
            },
          },
        },
      },
    },
  },
  'decision-sail-48': {
    title: 'Ceder y mantener: actuar mientras evoluciona el riesgo',
    brief: 'Inspecciona el diagrama y el informe antes de responder.',
    limitations:
      'Estudia las reglas internacionales del RIPA citadas y las aplicables a tus aguas. Practica con un instructor; los diagramas evalúan el razonamiento, no la competencia real para evitar abordajes.',
    stages: {
      early: {
        title: 'Haz clara la acción',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Haz clara la acción',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Eres quien cede en un cruce a la vista. Hay espacio para una alteración temprana. Has revisado tráfico y peligros.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Cambiar de forma decidida y visible y comprobar el efecto',
              'choice-1': 'Hacer muchos giros mínimos difíciles de ver',
              'choice-2': 'Esperar a estar muy cerca',
            },
          },
        },
      },
      may: {
        title: 'El otro no actúa',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'El otro no actúa',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Ahora eres B, quien mantiene, en un cruce de motores. A está a babor y claramente no actúa bien. Todavía hay espacio antes de que A solo ya no pueda evitar el abordaje.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Debes esperar a la emergencia',
              'choice-1': 'Puedes actuar; evita caer a babor por A si es posible',
              'choice-2': 'Una llamada transfiere toda responsabilidad a A',
            },
          },
        },
      },
      must: {
        title: 'Ahora actuar es obligatorio',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Ahora actuar es obligatorio',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'La siguiente observación muestra tanta cercanía que A solo no puede evitar el abordaje. Sigues siendo B. La maniobra depende de espacio y peligros.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Mantener rumbo y velocidad pase lo que pase',
              'choice-1': 'Señalar sin actuar para evitarlo',
              'choice-2': 'Actuar como mejor ayude a evitar el abordaje',
            },
          },
        },
      },
    },
  },
  'decision-sail-49': {
    title: 'Buques especiales, canales angostos y vías de circulación',
    brief: 'Inspecciona el diagrama y el informe antes de responder.',
    limitations:
      'Estudia las reglas internacionales del RIPA citadas y las aplicables a tus aguas. Practica con un instructor; los diagramas evalúan el razonamiento, no la competencia real para evitar abordajes.',
    stages: {
      status: {
        title: 'Comprueba el estado real',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Comprueba el estado real',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'B es una lancha recreativa al curricán sin restricción de maniobra ni otro estado especial. Clasifícala antes de aplicar reglas de encuentro.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Motor ordinario',
              'choice-1': 'Siempre pesquero privilegiado',
              'choice-2': 'Sin gobierno',
            },
          },
        },
      },
      channel: {
        title: 'Deja libre el paso del canal',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Deja libre el paso del canal',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Tu velero A de 12 m va a cruzar un canal. B solo navega seguro dentro. Cruzar ahora lo estorbaría y puedes esperar seguro fuera.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Cruzar por delante porque A lleva velas',
              'choice-1': 'Esperar fuera y cruzar sin estorbar a B',
              'choice-2': 'Fondear en medio del canal',
            },
          },
        },
      },
      lane: {
        title: 'Planifica el cruce de vía',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Planifica el cruce de vía',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'A debe cruzar una vía OMI hacia el norte. La corriente lo deriva al este. Hay hueco seguro sin estorbar a motores de la vía. Elige el principio del rumbo.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Seguir la vía indefinidamente',
              'choice-1': 'Cualquier rumbo si la derrota es perpendicular',
              'choice-2': 'Cruzar con rumbo casi perpendicular al tráfico',
            },
          },
        },
      },
    },
  },
  'decision-sail-50': {
    title: 'Interpretar luces, marcas y señales acústicas',
    brief: 'Inspecciona el diagrama y el informe antes de responder.',
    limitations:
      'Estudia las reglas internacionales del RIPA citadas y las aplicables a tus aguas. Practica con un instructor; los diagramas evalúan el razonamiento, no la competencia real para evitar abordajes.',
    stages: {
      lights: {
        title: 'Lee el patrón vertical',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Lee el patrón vertical',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'De noche a la vista, B muestra tres luces todo horizonte verticales: roja, blanca, roja. Son luces de estado; otras dependen de actividad y movimiento.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Maniobra restringida',
              'choice-1': 'Velero amurado a babor',
              'choice-2': 'Sin estado especial',
            },
          },
        },
      },
      shape: {
        title: 'Identifica el cono diurno',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Identifica el cono diurno',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'B navega con velas y muestra un cono negro vértice abajo, sin otro estado especial. ¿Qué propulsión comunica?',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Solo propulsión a vela',
              'choice-1': 'También propulsado por máquina: motor',
              'choice-2': 'Fondeado',
            },
          },
        },
      },
      doubt: {
        title: 'Señala la duda pronto',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Señala la duda pronto',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Los buques se acercan a la vista. No entiendes la intención de B y dudas de su actuación suficiente. Elige señal internacional y seguimiento.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Una prolongada y dejar de observar',
              'choice-1': 'Tres cortas para exigir preferencia',
              'choice-2': 'Al menos cinco cortas rápidas; seguir evaluando y actuando',
            },
          },
        },
      },
    },
  },
  'decision-sail-51': {
    title: 'Visibilidad restringida y plan completo de encuentro',
    brief: 'Inspecciona el diagrama y el informe antes de responder.',
    limitations:
      'Estudia las reglas internacionales del RIPA citadas y las aplicables a tus aguas. Practica con un instructor; los diagramas evalúan el razonamiento, no la competencia real para evitar abordajes.',
    stages: {
      radar: {
        title: 'Evalúa el contacto no visible',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Evalúa el contacto no visible',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'En niebla, B aparece solo en radar a proa del través. Hay riesgo y no lo alcanzas. Si cambias rumbo, ¿qué dirección evitas en lo posible según 19(d)?',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Evitar caer a babor por B y evaluar opciones seguras',
              'choice-1': 'Girar siempre a babor',
              'choice-2': 'Reclamar mantener por no ver a B',
            },
          },
        },
      },
      sound: {
        title: 'Una señal de niebla por proa',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Una señal de niebla por proa',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Ahora oyes niebla aparentemente a proa del través. No has descartado riesgo. Tu yate va a motor.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Mantener crucero hasta verlo',
              'choice-1':
                'Reducir al mínimo para gobernar, suprimir arrancada si hace falta y extremar cautela',
              'choice-2': 'Tocar la bocina en vez de cambiar velocidad',
            },
          },
        },
      },
      reassess: {
        title: 'Reevalúa después de actuar',
        brief: 'Inspecciona el diagrama y el informe antes de responder.',
        goal: 'Reevalúa después de actuar',
        success: 'Etapa completada. Reevalúa la siguiente situación por sus propios hechos.',
        retry: 'Revisa el encuentro, la regla y las obligaciones de ambos, y corrige tu decisión.',
        facts: {
          report: {
            label: 'Informe de situación',
            text: 'Has reducido y comenzado a evitarlo. El radar nuevo muestra igual demora y menor distancia. El contacto sigue sin verse y no se ha confirmado paso seguro.',
          },
        },
        fields: {
          response: {
            label: 'Tu decisión',
            options: {
              'choice-0': 'Declarar libre porque ya actuaste',
              'choice-1': 'Pasar a prioridad ordinaria de vela',
              'choice-2':
                'Mantener el riesgo abierto, revisar la acción y vigilar hasta confirmar paso seguro',
            },
          },
        },
      },
    },
  },
};
