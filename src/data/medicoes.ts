export type TipoMedicao = 'glicose' | 'pressao' | 'batimentos';

export type Medicao = {
  id: string;
  tipo: TipoMedicao;
  valor: number;
  diastolica?: number;
  data: string;
};

const CHAVE = 'vida-saude-medicoes-v1';

export const TIPOS: TipoMedicao[] = ['glicose', 'pressao', 'batimentos'];

export const CONFIG: Record<TipoMedicao, {
  nome: string;
  curto: string;
  unidade: string;
}> = {
  glicose: { nome: 'Glicose', curto: 'Glicose', unidade: 'mg/dL' },
  pressao: { nome: 'Pressão Arterial', curto: 'Pressão', unidade: 'mmHg' },
  batimentos: { nome: 'Batimentos', curto: 'Batim.', unidade: 'bpm' },
};

function exemplos(): Medicao[] {
  const glicose = [105, 92, 98, 110, 88, 96, 101];
  const sistolica = [127, 120, 132, 135, 124, 130, 121];
  const diastolica = [84, 80, 86, 82, 79, 83, 77];
  const batimentos = [69, 73, 71, 80, 68, 75, 72];
  const lista: Medicao[] = [];

  for (let dia = 0; dia < 7; dia++) {
    const data = new Date();
    data.setDate(data.getDate() - dia);
    data.setHours(7, 30, 0, 0);
    const instante = data.toISOString();
    lista.push(
      { id: `demo-g-${dia}`, tipo: 'glicose', valor: glicose[dia], data: instante },
      { id: `demo-p-${dia}`, tipo: 'pressao', valor: sistolica[dia], diastolica: diastolica[dia], data: instante },
      { id: `demo-b-${dia}`, tipo: 'batimentos', valor: batimentos[dia], data: instante },
    );
  }
  return lista;
}

function medicaoValida(value: unknown): value is Medicao {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Partial<Medicao>;
  return typeof m.id === 'string' && TIPOS.includes(m.tipo as TipoMedicao)
    && typeof m.valor === 'number' && Number.isFinite(m.valor)
    && typeof m.data === 'string' && Number.isFinite(Date.parse(m.data))
    && (m.tipo !== 'pressao' || (typeof m.diastolica === 'number' && Number.isFinite(m.diastolica)));
}

export function lerMedicoes(): Medicao[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto !== null) {
      const lista: unknown = JSON.parse(bruto);
      if (Array.isArray(lista) && lista.every(medicaoValida)) return lista;
    }
  } catch { /* armazenamento pode estar bloqueado */ }
  return exemplos();
}

export function guardarMedicao(nova: Medicao): void {
  const atual = lerMedicoes();
  localStorage.setItem(CHAVE, JSON.stringify([nova, ...atual]));
  window.dispatchEvent(new Event('vida-saude-medicoes-atualizadas'));
}

export function ordenar(lista: Medicao[]): Medicao[] {
  return [...lista].sort((a, b) => Date.parse(b.data) - Date.parse(a.data));
}

export function ultimaMedicao(lista: Medicao[], tipo: TipoMedicao): Medicao | undefined {
  return ordenar(lista.filter((item) => item.tipo === tipo))[0];
}

export function formatarValor(m: Medicao): string {
  return m.tipo === 'pressao' ? `${m.valor}/${m.diastolica}` : String(m.valor);
}

// Rótulos reproduzem a interface de demonstração do Figma,
// NÃO representam avaliação ou diagnóstico médico.
export function statusDemonstrativo(m: Medicao): 'Normal' | 'Atenção' | 'Elevada' {
  if (m.tipo === 'pressao') return m.valor >= 120 || (m.diastolica ?? 0) >= 80 ? 'Elevada' : 'Normal';
  if (m.tipo === 'glicose') return m.valor >= 100 ? 'Atenção' : 'Normal';
  return m.valor >= 60 && m.valor <= 100 ? 'Normal' : 'Atenção';
}

export function dataCompleta(data = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  }).format(data);
}

export function dataCurta(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'numeric' }).format(new Date(iso));
}

export function horaCurta(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}
