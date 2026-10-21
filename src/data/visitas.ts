/** Solicitações fictícias de visitas. Os comprovantes são apenas declarações, sem upload real. */
import type { Conta, Papel } from './portal';
import { podeAprovarVisitas } from './portal';

export type SituacaoVisita = 'pendente' | 'aprovada' | 'recusada' | 'cancelada';
export type VínculoConferido = 'pendente' | 'conferido';
export type Visita = {
  id: string;
  solicitanteId: string;
  solicitanteNome: string;
  papel: Papel;
  idosoId: 'demo-idoso';
  idosoNome: string;
  relacao: string;
  comprovacao: string;
  declarado: boolean;
  data: string;
  hora: string;
  observacoes: string;
  status: SituacaoVisita;
  conferido: VínculoConferido;
  observacaoResposta: string;
  criadaEm: string;
};

export type DadosPedido = Pick<Visita, 'relacao' | 'comprovacao' | 'declarado' | 'data' | 'hora' | 'observacoes'>;
const CHAVE = 'vida-saude-pedidos-visita-v1';
export const EVENTO_VISITAS = 'vida-saude-visitas-atualizadas';

export function dataLocal(diasAdiante = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + diasAdiante);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function exemplares(): Visita[] {
  return [
    {
      id: 'VS-1001', solicitanteId: 'demo-familiar', solicitanteNome: 'João Silva', papel: 'familiar',
      idosoId: 'demo-idoso', idosoNome: 'Maria Oliveira', relacao: 'Filho',
      comprovacao: 'Declaração de parentesco (simulada)', declarado: true,
      data: dataLocal(2), hora: '15:00', observacoes: 'Visita no período da tarde.',
      status: 'pendente', conferido: 'pendente', observacaoResposta: '', criadaEm: new Date().toISOString(),
    },
    {
      id: 'VS-1002', solicitanteId: 'demo-visitante', solicitanteNome: 'Clara Souza', papel: 'visitante',
      idosoId: 'demo-idoso', idosoNome: 'Maria Oliveira', relacao: 'Amiga',
      comprovacao: 'Convite informado pelo visitante (simulado)', declarado: true,
      data: dataLocal(4), hora: '10:00', observacoes: 'Visita social.',
      status: 'pendente', conferido: 'pendente', observacaoResposta: '', criadaEm: new Date().toISOString(),
    },
  ];
}

export function lerVisitas(): Visita[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto === null) return exemplares();
    const dados: unknown = JSON.parse(bruto);
    if (!Array.isArray(dados)) return exemplares();
    return dados.filter((item): item is Visita =>
      Boolean(item && typeof item.id === 'string' && typeof item.solicitanteId === 'string'
        && typeof item.data === 'string' && typeof item.hora === 'string'
        && ['pendente', 'aprovada', 'recusada', 'cancelada'].includes(item.status)
        && ['pendente', 'conferido'].includes(item.conferido)));
  } catch { return exemplares(); }
}

function salvar(visitas: Visita[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(visitas));
    window.dispatchEvent(new Event(EVENTO_VISITAS));
  } catch { throw new Error('Não foi possível salvar. O armazenamento do navegador está indisponível.'); }
}

export function visitasVisiveis(conta: Conta, visitas: Visita[]): Visita[] {
  if (conta.papel === 'idoso' || podeAprovarVisitas(conta)) return visitas;
  if (conta.papel === 'cuidador') return [];
  return visitas.filter((visita) => visita.solicitanteId === conta.id);
}

export function verificarPedido(dados: DadosPedido): string {
  if (dados.relacao.trim().length < 3) return 'Informe o grau de parentesco ou amizade.';
  if (!dados.comprovacao) return 'Escolha uma forma de comprovação demonstrativa.';
  if (!dados.declarado) return 'Confirme a declaração de vínculo para continuar.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data)) return 'Selecione uma data válida.';
  const dt = new Date(`${dados.data}T12:00:00`);
  if (!Number.isFinite(dt.getTime()) || dt.toISOString().slice(0, 10) !== dados.data || dados.data < dataLocal()) {
    return 'Selecione hoje ou uma data futura válida.';
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(dados.hora)) return 'Selecione um horário válido.';
  if (dados.hora < '08:00' || dados.hora > '18:00') return 'As visitas demonstrativas ocorrem entre 08:00 e 18:00.';
  if (dados.data === dataLocal() && dados.hora <= new Date().toTimeString().slice(0, 5)) {
    return 'Para visitas de hoje, escolha um horário futuro.';
  }
  return '';
}

export function solicitarVisita(conta: Conta, dados: DadosPedido, nomeIdoso: string): Visita {
  if (conta.papel !== 'visitante' && conta.papel !== 'familiar') throw new Error('Este perfil não pode solicitar visitas.');
  const erro = verificarPedido(dados);
  if (erro) throw new Error(erro);
  const visita: Visita = {
    ...dados, idosoId: 'demo-idoso', idosoNome: nomeIdoso,
    id: `VS-${Date.now().toString(36).toUpperCase()}`,
    solicitanteId: conta.id, solicitanteNome: conta.nome, papel: conta.papel,
    relacao: dados.relacao.trim(), observacoes: dados.observacoes.trim(),
    status: 'pendente', conferido: 'pendente', observacaoResposta: '', criadaEm: new Date().toISOString(),
  };
  salvar([visita, ...lerVisitas()]);
  return visita;
}

export function conferirVinculo(cuidador: Conta, id: string): void {
  if (!podeAprovarVisitas(cuidador)) throw new Error('Apenas o cuidador demonstrativo habilitado pode conferir vínculos.');
  const visitas = lerVisitas();
  const visita = visitas.find((item) => item.id === id);
  if (!visita || visita.status !== 'pendente' || !visita.declarado || !visita.comprovacao) throw new Error('A solicitação não pode ser conferida.');
  salvar(visitas.map((item) => item.id === id ? { ...item, conferido: 'conferido' as const } : item));
}

export function decidirVisita(cuidador: Conta, id: string, resposta: 'aprovada' | 'recusada', observacao: string) {
  if (!podeAprovarVisitas(cuidador)) throw new Error('Seu perfil não tem permissão para analisar visitas.');
  const visitas = lerVisitas();
  const visita = visitas.find((item) => item.id === id);
  if (!visita || visita.status !== 'pendente') throw new Error('Solicitação não encontrada ou já analisada.');
  if (resposta === 'aprovada' && visita.conferido !== 'conferido') {
    throw new Error('É necessário conferir o vínculo antes de aprovar a visita.');
  }
  if (resposta === 'recusada' && observacao.trim().length < 5) {
    throw new Error('Explique o motivo da recusa (pelo menos 5 caracteres).');
  }
  salvar(visitas.map((item) => item.id === id ? { ...item, status: resposta, observacaoResposta: observacao.trim() } : item));
}

export function cancelarVisita(conta: Conta, id: string) {
  const visitas = lerVisitas();
  const visita = visitas.find((item) => item.id === id);
  if (!visita || visita.solicitanteId !== conta.id || visita.status !== 'pendente') {
    throw new Error('Apenas o solicitante pode cancelar uma visita pendente.');
  }
  salvar(visitas.map((item) => item.id === id ? { ...item, status: 'cancelada' as const } : item));
}

export function dataVisita(valor: string) {
  const [a, m, d] = valor.split('-');
  return `${d}/${m}/${a}`;
}

export const ROTULOS_STATUS: Record<SituacaoVisita, string> = {
  pendente: 'Aguardando análise', aprovada: 'Aprovada', recusada: 'Recusada', cancelada: 'Cancelada',
};
