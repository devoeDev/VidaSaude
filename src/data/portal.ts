/** Identidades e permissões APENAS para demonstração local, sem autenticação real. */
import { lerPerfil } from './perfil';

export type Papel = 'idoso' | 'cuidador' | 'familiar' | 'visitante';
export type SituacaoConta = 'demonstracao' | 'pendente';
export type Conta = {
  id: string;
  nome: string;
  papel: Papel;
  telefone: string;
  email: string;
  vinculo: string;
  situacao: SituacaoConta;
};

export const PAPEIS: Record<Papel, string> = {
  idoso: 'Idoso(a)',
  cuidador: 'Cuidador(a)',
  familiar: 'Familiar',
  visitante: 'Visitante',
};

const CHAVE_CONTAS = 'vida-saude-contas-portal-v1';
const CHAVE_SESSAO = 'vida-saude-sessao-v1';
export const EVENTO_PORTAL = 'vida-saude-portal-atualizado';

function exemplos(): Conta[] {
  const perfil = lerPerfil();
  return [
    { id: 'demo-idoso', nome: perfil.nome, papel: 'idoso', telefone: perfil.telefone, email: '', vinculo: '', situacao: 'demonstracao' },
    { id: 'demo-cuidador', nome: 'Ana Lima', papel: 'cuidador', telefone: '(79) 99999-1001', email: 'ana@exemplo.test', vinculo: 'Cuidadora responsável', situacao: 'demonstracao' },
    { id: 'demo-familiar', nome: 'João Silva', papel: 'familiar', telefone: '(79) 99999-1002', email: 'joao@exemplo.test', vinculo: 'Filho', situacao: 'demonstracao' },
    { id: 'demo-visitante', nome: 'Clara Souza', papel: 'visitante', telefone: '(79) 99999-1003', email: 'clara@exemplo.test', vinculo: 'Amiga', situacao: 'demonstracao' },
  ];
}

export function listarContas(): Conta[] {
  const fixas = exemplos();
  try {
    const armazenado: unknown = JSON.parse(localStorage.getItem(CHAVE_CONTAS) ?? '[]');
    if (!Array.isArray(armazenado)) return fixas;
    const extras = armazenado.filter((item): item is Conta =>
      Boolean(item && typeof item.id === 'string' && typeof item.nome === 'string'
        && typeof item.papel === 'string' && ['idoso', 'cuidador', 'familiar', 'visitante'].includes(item.papel)
        && typeof item.telefone === 'string' && typeof item.email === 'string'
        && typeof item.vinculo === 'string' && item.situacao === 'pendente'));
    return [...fixas, ...extras];
  } catch { return fixas; }
}

export function lerSessao(): Conta {
  try {
    const id = sessionStorage.getItem(CHAVE_SESSAO);
    return listarContas().find((conta) => conta.id === id) ?? listarContas()[0];
  } catch { return exemplos()[0]; }
}

export function iniciarSessao(id: string): Conta {
  const conta = listarContas().find((item) => item.id === id);
  if (!conta) throw new Error('Perfil demonstrativo não encontrado.');
  try { sessionStorage.setItem(CHAVE_SESSAO, conta.id); } catch { /* ambiente restrito */ }
  window.dispatchEvent(new Event(EVENTO_PORTAL));
  return conta;
}

export function finalizarSessao() {
  try {
    sessionStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem('vida-saude-demo');
  } catch { /* ambiente restrito */ }
  window.dispatchEvent(new Event(EVENTO_PORTAL));
}

export function cadastrarConta(dados: Omit<Conta, 'id' | 'situacao'>): Conta {
  if (dados.papel === 'idoso') throw new Error('Utilize o cadastro principal para o perfil do idoso.');
  const existentes = listarContas();
  const telefone = dados.telefone.replace(/\D/g, '');
  if (existentes.some((c) => c.telefone.replace(/\D/g, '') === telefone)) {
    throw new Error('Esse telefone já está associado a um perfil demonstrativo.');
  }
  const nova: Conta = { ...dados, id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, situacao: 'pendente' };
  try {
    const extras = existentes.filter((item) => item.id.startsWith('local-'));
    localStorage.setItem(CHAVE_CONTAS, JSON.stringify([...extras, nova]));
    window.dispatchEvent(new Event(EVENTO_PORTAL));
    return nova;
  } catch {
    throw new Error('Não foi possível guardar o cadastro. Verifique se o navegador permite armazenamento local.');
  }
}

export function podeAprovarVisitas(conta: Conta): boolean {
  return conta.papel === 'cuidador' && conta.situacao === 'demonstracao';
}

export function podeSolicitarVisita(conta: Conta): boolean {
  return conta.papel === 'visitante' || conta.papel === 'familiar';
}

export function caminhoInicial(conta: Conta) {
  return conta.papel === 'idoso' ? '/inicio' : '/portal';
}
