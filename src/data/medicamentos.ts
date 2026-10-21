
/**
 * VidaSaúde — Agenda de Medicamentos
 * Dados demonstrativos, sem backend ou API médica.
 */

export type HorarioMedicamento = {
  id: string;
  hora: string;
  itens: {
    nome: string;
    dose: string;
    cor: string;
  }[];
};

export const AGENDA: HorarioMedicamento[] = [
  {
    id: '07',
    hora: '07:00',
    itens: [
      { nome: 'Metformina', dose: '500mg', cor: 'roxo' },
    ],
  },
  {
    id: '08',
    hora: '08:00',
    itens: [
      { nome: 'Losartana', dose: '50mg', cor: 'azul' },
      { nome: 'Atenolol', dose: '25mg', cor: 'verde' },
    ],
  },
  {
    id: '12',
    hora: '12:00',
    itens: [
      { nome: 'AAS', dose: '100mg', cor: 'laranja' },
    ],
  },
  {
    id: '19',
    hora: '19:00',
    itens: [
      { nome: 'Metformina', dose: '500mg', cor: 'roxo' },
    ],
  },
  {
    id: '20',
    hora: '20:00',
    itens: [
      { nome: 'Atenolol', dose: '25mg', cor: 'verde' },
    ],
  },
  {
    id: '21',
    hora: '21:00',
    itens: [
      { nome: 'Sinvastatina', dose: '20mg', cor: 'laranja' },
    ],
  },
];

type StatusAgenda = Record<string, boolean>;

const CHAVE = 'vida-saude-agenda-v2';
const CHAVE_LEGADA = 'vida-saude-remedio-tomado';

/**
 * Retorna a data atual no formato YYYY-MM-DD.
 */
export function chaveDia(data = new Date()): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

/**
 * Estado inicial da agenda demonstrativa.
 * Cinco medicamentos tomados e um pendente.
 */
function dadosIniciais(): StatusAgenda {
  const status: StatusAgenda = {};

  for (const item of AGENDA) {
    status[item.id] = item.id !== '21';
  }

  return status;
}

/**
 * Recupera a agenda salva no navegador.
 */
export function lerAgenda(): StatusAgenda {
  const padrao = dadosIniciais();

  try {
    const bruto = localStorage.getItem(CHAVE);

    if (bruto) {
      const item: unknown = JSON.parse(bruto);

      if (
        item !== null &&
        typeof item === 'object' &&
        'dia' in item &&
        'status' in item
      ) {
        const registro = item as {
          dia: unknown;
          status: unknown;
        };

        if (
          registro.dia === chaveDia() &&
          registro.status !== null &&
          typeof registro.status === 'object' &&
          !Array.isArray(registro.status)
        ) {
          const mapa = registro.status as Record<
            string,
            unknown
          >;

          // Construção tipada: todos os valores
          // precisam ser booleanos.
          const status: StatusAgenda = {};

          for (const horario of AGENDA) {
            const valor = mapa[horario.id];

            status[horario.id] =
              typeof valor === 'boolean'
                ? valor
                : padrao[horario.id];
          }

          return status;
        }
      }
    }

    /**
     * Compatibilidade com o armazenamento antigo.
     */
    const antiga = localStorage.getItem(CHAVE_LEGADA);

    const hoje = new Date();

    const dataLegada =
      `${hoje.getFullYear()}-` +
      `${hoje.getMonth() + 1}-` +
      `${hoje.getDate()}`;

    if (
      antiga === chaveDia() ||
      antiga === dataLegada
    ) {
      padrao['21'] = true;
    }
  } catch {
    // Continua funcionando se o armazenamento falhar.
  }

  return padrao;
}

/**
 * Salva a agenda e avisa outras telas.
 */
export function salvarAgenda(
  status: StatusAgenda
): boolean {
  try {
    localStorage.setItem(
      CHAVE,
      JSON.stringify({
        dia: chaveDia(),
        status,
      })
    );

    window.dispatchEvent(
      new Event('vida-saude-agenda-atualizada')
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Primeiro medicamento ainda pendente.
 */
export function proximoLembrete(
  status: StatusAgenda
): HorarioMedicamento | undefined {
  return AGENDA.find(
    (item) => !status[item.id]
  );
}

/**
 * Quantidade de horários concluídos.
 */
export function totalConcluidos(
  status: StatusAgenda
): number {
  return AGENDA.filter(
    (item) => status[item.id]
  ).length;
}

/**
 * Lista agrupada por nome do medicamento.
 */
export function listaMedicamentos() {
  const nomes = [
    'Metformina',
    'Losartana',
    'Atenolol',
    'AAS',
    'Sinvastatina',
  ];

  return nomes.map((nome) => ({
    nome,

    slots: AGENDA.filter((slot) =>
      slot.itens.some(
        (item) => item.nome === nome
      )
    ),

    dados: AGENDA.flatMap(
      (slot) => slot.itens
    ).find(
      (item) => item.nome === nome
    )!,
  }));
}
