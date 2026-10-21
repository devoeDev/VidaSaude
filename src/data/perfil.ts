export type Medico = { id: string; nome: string; especialidade: string; telefone: string };
export type Perfil = {
  nome: string;
  telefone: string;
  dataNascimento: string;
  tipoSanguineo: string;
  contatoNome: string;
  contatoTelefone: string;
  alergias: string;
  condicoes: string;
  medicos: Medico[];
  lembretes: boolean;
  sons: boolean;
  vibracao: boolean;
  fonte: 'Pequeno' | 'Médio' | 'Grande';
};
const CHAVE = 'vida-saude-perfil-completo-v1';
export const perfilPadrao: Perfil = {
  nome: 'Maria Oliveira', telefone: '(11) 99999-9999', dataNascimento: '1955-03-15',
  tipoSanguineo: 'O Positivo (O+)', contatoNome: 'João Silva', contatoTelefone: '(11) 98888-7777',
  alergias: 'Dipirona', condicoes: 'Diabetes Tipo 2 · Hipertensão arterial',
  medicos: [
    { id: 'carlos', nome: 'Dr. Carlos Santos', especialidade: 'Cardiologista', telefone: '(11) 97833-5555' },
    { id: 'ana', nome: 'Dra. Ana Lima', especialidade: 'Endocrinologista', telefone: '(11) 99964-4322' },
  ],
  lembretes: true, sons: true, vibracao: true, fonte: 'Médio',
};

export function lerPerfil(): Perfil {
  let base = { ...perfilPadrao, medicos: [...perfilPadrao.medicos] };
  try {
    const cadastro = localStorage.getItem('vida-saude-perfil-demo');
    if (cadastro) {
      const dados: unknown = JSON.parse(cadastro);
      if (dados && typeof dados === 'object') {
        const c = dados as Record<string, unknown>;
        if (typeof c.nome === 'string' && c.nome.trim()) base.nome = c.nome.trim();
        if (typeof c.telefone === 'string' && c.telefone.trim()) base.telefone = c.telefone;
        if (typeof c.dataNascimento === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.dataNascimento)) base.dataNascimento = c.dataNascimento;
      }
    }
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) {
      const dados: unknown = JSON.parse(salvo);
      if (dados && typeof dados === 'object' && !Array.isArray(dados)) {
        const c = dados as Partial<Perfil>;
        for (const k of ['nome','telefone','dataNascimento','tipoSanguineo','contatoNome','contatoTelefone','alergias','condicoes'] as const) {
          if (typeof c[k] === 'string') base[k] = c[k]!;
        }
        for (const k of ['lembretes','sons','vibracao'] as const) {
          if (typeof c[k] === 'boolean') base[k] = c[k]!;
        }
        if (c.fonte === 'Grande' || c.fonte === 'Médio' || c.fonte === 'Pequeno') base.fonte = c.fonte;
        if (Array.isArray(c.medicos)) {
          base.medicos = c.medicos.filter((m): m is Medico => Boolean(m && typeof m.id === 'string' && typeof m.nome === 'string' && typeof m.especialidade === 'string' && typeof m.telefone === 'string'));
        }
      }
    }
  } catch { /* mantém valores demonstrativos */ }
  return base;
}

export function salvarPerfil(perfil: Perfil): boolean {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(perfil));
    window.dispatchEvent(new Event('vida-saude-perfil-atualizado'));
    return true;
  } catch { return false; }
}

export function idade(data: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  const [ano, mes, dia] = data.split('-').map(Number);
  const hoje = new Date();
  let anos = hoje.getFullYear() - ano;
  if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) anos--;
  return anos >= 0 && anos < 125 ? anos : null;
}

export function formatarNascimento(data: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return data;
  const [ano, mes, dia] = data.split('-');
  const anos = idade(data);
  return `${dia}/${mes}/${ano}${anos !== null ? ` · ${anos} anos` : ''}`;
}
