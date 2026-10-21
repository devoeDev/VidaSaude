/** Agenda de demonstração: sem prescrições, notificações ou API médica. */
export type HorarioMedicamento = {
  id: string;
  hora: string;
  itens: { nome: string; dose: string; cor: string }[];
};

export const AGENDA: HorarioMedicamento[] = [
  { id: '07', hora: '07:00', itens: [{ nome: 'Metformina', dose: '500mg', cor: 'roxo' }] },
  { id: '08', hora: '08:00', itens: [
    { nome: 'Losartana', dose: '50mg', cor: 'azul' },
    { nome: 'Atenolol', dose: '25mg', cor: 'verde' },
  ] },
  { id: '12', hora: '12:00', itens: [{ nome: 'AAS', dose: '100mg', cor: 'laranja' }] },
  { id: '19', hora: '19:00', itens: [{ nome: 'Metformina', dose: '500mg', cor: 'roxo' }] },
  { id: '20', hora: '20:00', itens: [{ nome: 'Atenolol', dose: '25mg', cor: 'verde' }] },
  { id: '21', hora: '21:00', itens: [{ nome: 'Sinvastatina', dose: '20mg', cor: 'laranja' }] },
];

type StatusAgenda = Record<string, boolean>;
const CHAVE = 'vida-saude-agenda-v2';
const CHAVE_LEGADA = 'vida-saude-remedio-tomado';

export function chaveDia(data = new Date()) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

function dadosIniciais(): StatusAgenda {
  // A tela de demonstração começa como no Figma: 5/6 horários concluídos.
  return Object.fromEntries(AGENDA.map((item) => [item.id, item.id !== '21']));
}

export function lerAgenda(): StatusAgenda {
  const padrao = dadosIniciais();
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const item: unknown = JSON.parse(bruto);
      if (item && typeof item === 'object' && 'dia' in item && 'status' in item) {
        const registro = item as { dia: unknown; status: unknown };
        if (registro.dia === chaveDia() && registro.status && typeof registro.status === 'object') {
          const mapa = registro.status as Record<string, unknown>;
          return Object.fromEntries(AGENDA.map((a) => [a.id, typeof mapa[a.id] === 'boolean' ? mapa[a.id] : padrao[a.id]]));
        }
      }
    }
    // Compatibilidade com o botão "Marcar como tomado" da tela inicial anterior.
    const antiga = localStorage.getItem(CHAVE_LEGADA);
    if (antiga === chaveDia() || antiga === `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`) {
      padrao['21'] = true;
    }
  } catch { /* LocalStorage pode estar desativado. */ }
  return padrao;
}

export function salvarAgenda(status: StatusAgenda): boolean {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ dia: chaveDia(), status }));
    // Não escrever na chave antiga; a agenda nova é a fonte principal.
    window.dispatchEvent(new Event('vida-saude-agenda-atualizada'));
    return true;
  } catch { return false; }
}

export function proximoLembrete(status: StatusAgenda) {
  return AGENDA.find((item) => !status[item.id]);
}

export function totalConcluidos(status: StatusAgenda) {
  return AGENDA.filter((item) => status[item.id]).length;
}

export function listaMedicamentos() {
  const nomes = ['Metformina', 'Losartana', 'Atenolol', 'AAS', 'Sinvastatina'];
  return nomes.map((nome) => ({
    nome,
    slots: AGENDA.filter((slot) => slot.itens.some((item) => item.nome === nome)),
    dados: AGENDA.flatMap((slot) => slot.itens).find((item) => item.nome === nome)!,
  }));
}
