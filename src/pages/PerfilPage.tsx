import { finalizarSessao } from '../data/portal';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CareShell from '../components/CareShell';
import VidaIcon from '../components/VidaIcon';
import { formatarTelefone, telefoneValido } from '../utils/telefone';
import { formatarNascimento, lerPerfil, salvarPerfil, type Perfil, type Medico } from '../data/perfil';

type ChaveCampo = 'nome' | 'telefone' | 'dataNascimento' | 'tipoSanguineo' | 'contatoNome' | 'contatoTelefone' | 'alergias' | 'condicoes';
type Edicao = { tipo: 'campo'; chave: ChaveCampo } | { tipo: 'medico'; id?: string } | { tipo: 'sobre'; titulo: string } | null;
const rotulos: Record<ChaveCampo, string> = {
  nome: 'Nome Completo', telefone: 'Telefone', dataNascimento: 'Nascimento',
  tipoSanguineo: 'Tipo Sanguíneo', contatoNome: 'Nome do contato de emergência',
  contatoTelefone: 'Telefone do contato de emergência', alergias: 'Alergias', condicoes: 'Condições médicas',
};

function TextField({ titulo, valor, editar }: { titulo: string; valor: string; editar: () => void }) {
  return <div className="care-info-row"><div><small>{titulo}</small><strong>{valor || 'Não informado'}</strong></div><button type="button" onClick={editar}>Editar</button></div>;
}

export default function PerfilPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [perfil, setPerfil] = useState<Perfil>(lerPerfil);
  const [edicao, setEdicao] = useState<Edicao>(null);
  const [valor, setValor] = useState('');
  const [nomeMedico, setNomeMedico] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [telefoneMedico, setTelefoneMedico] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    if (params.get('editar') === 'contato') {
      setEdicao({ tipo: 'campo', chave: 'contatoTelefone' });
      setValor(lerPerfil().contatoTelefone);
    }
  }, [params]);

  function atualizar(novo: Perfil, mensagem = 'Alterações salvas com sucesso!') {
    setPerfil(novo);
    setAviso(salvarPerfil(novo) ? mensagem : 'Alteração visível nesta tela, mas o navegador não permitiu salvar.');
  }

  function abrirCampo(chave: ChaveCampo) {
    setValor(perfil[chave]);
    setErro('');
    setEdicao({ tipo: 'campo', chave });
  }

  function abrirMedico(medico?: Medico) {
    setNomeMedico(medico?.nome ?? '');
    setEspecialidade(medico?.especialidade ?? '');
    setTelefoneMedico(medico?.telefone ?? '');
    setErro('');
    setEdicao({ tipo: 'medico', id: medico?.id });
  }

  function salvarEdicao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!edicao || edicao.tipo === 'sobre') return;
    if (edicao.tipo === 'campo') {
      const chave = edicao.chave;
      if (!valor.trim()) { setErro('Preencha este campo.'); return; }
      if ((chave === 'telefone' || chave === 'contatoTelefone') && !telefoneValido(valor)) {
        setErro('Digite um telefone válido com DDD.'); return;
      }
      if (chave === 'dataNascimento') {
        const data = new Date(`${valor}T12:00:00`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(data.getTime()) || data > new Date()) {
          setErro('Informe uma data de nascimento válida.'); return;
        }
      }
      atualizar({ ...perfil, [chave]: valor.trim() });
    } else {
      if (!nomeMedico.trim() || !especialidade.trim()) { setErro('Preencha nome e especialidade.'); return; }
      if (!telefoneValido(telefoneMedico)) { setErro('Digite um telefone válido.'); return; }
      const novo: Medico = {
        id: edicao.id ?? `medico-${Date.now()}`,
        nome: nomeMedico.trim(), especialidade: especialidade.trim(), telefone: telefoneMedico,
      };
      atualizar({ ...perfil, medicos: edicao.id
        ? perfil.medicos.map((m) => m.id === edicao.id ? novo : m)
        : [...perfil.medicos, novo] });
    }
    setEdicao(null);
  }

  function escolherFonte(fonte: Perfil['fonte']) {
    atualizar({ ...perfil, fonte }, 'Tamanho da fonte atualizado.');
  }

  function sair() {
    finalizarSessao();
    navigate('/login', { replace: true });
  }

  const nascimento = formatarNascimento(perfil.dataNascimento);

  return (
    <CareShell className={`care-profile-screen care-font-${perfil.fonte === 'Grande' ? 'large' : perfil.fonte === 'Pequeno' ? 'small' : 'medium'}`}
      headerClass="care-profile-hero" back="/inicio" header={
        <div className="care-profile-heading"><span className="care-large-avatar">{perfil.nome[0]?.toUpperCase() || 'M'}</span>
          <h1>{perfil.nome}</h1><p>Dados Pessoais</p></div>
      }>
      <div className="care-profile-inner">
        {aviso && <div className="care-inline-message" role="status"><VidaIcon nome="check" tamanho={18}/>{aviso}<button type="button" aria-label="Fechar mensagem" onClick={() => setAviso('')}>×</button></div>}
        <section className="care-card care-personal-card" aria-label="Dados pessoais">
          <TextField titulo="Nome Completo" valor={perfil.nome} editar={() => abrirCampo('nome')} />
          <TextField titulo="Telefone" valor={perfil.telefone} editar={() => abrirCampo('telefone')} />
          <TextField titulo="Nascimento" valor={nascimento} editar={() => abrirCampo('dataNascimento')} />
          <TextField titulo="Tipo Sanguíneo" valor={perfil.tipoSanguineo} editar={() => abrirCampo('tipoSanguineo')} />
        </section>

        <h2 className="care-section-title">Contato de Emergência</h2>
        <section className="care-card care-contact-card">
          <span className="care-contact-symbol">☎</span>
          <div><strong>{perfil.contatoNome}</strong><small>{perfil.contatoTelefone}</small></div>
          <button type="button" onClick={() => abrirCampo('contatoNome')}>Editar nome</button>
          <button type="button" onClick={() => abrirCampo('contatoTelefone')}>Editar telefone</button>
        </section>

        <h2 className="care-section-title">Informações Médicas</h2>
        <section className="care-card care-medical-card">
          <TextField titulo="Alergias" valor={perfil.alergias} editar={() => abrirCampo('alergias')} />
          <TextField titulo="Condições" valor={perfil.condicoes} editar={() => abrirCampo('condicoes')} />
        </section>

        <h2 className="care-section-title">Meus Médicos</h2>
        <section className="care-card care-doctors-card">
          {perfil.medicos.map((medico) => (
            <div className="care-doctor-row" key={medico.id}>
              <span className="care-doctor-symbol">♧</span>
              <div><strong>{medico.nome}</strong><small>{medico.especialidade} · {medico.telefone}</small></div>
              <button type="button" onClick={() => abrirMedico(medico)}>Editar</button>
            </div>
          ))}
          <button type="button" className="care-add-doctor" onClick={() => abrirMedico()}>
            <span><VidaIcon nome="mais" tamanho={26} /></span> Adicionar Médico
          </button>
        </section>

        <h2 className="care-section-title">Configurações</h2>
        <section className="care-card care-settings-card">
          {([
            ['lembretes', 'Lembretes de Medicamentos', 'Alertas nos horários definidos'],
            ['sons', 'Sons de alerta', 'Toques sonoros nos lembretes'],
            ['vibracao', 'Vibração', 'Vibrar ao receber lembretes'],
          ] as const).map(([campo, titulo, descricao]) => (
            <label className="care-setting-row" key={campo}>
              <span><strong>{titulo}</strong><small>{descricao}</small></span>
              <input type="checkbox" checked={perfil[campo]} onChange={(e) => atualizar({ ...perfil, [campo]: e.target.checked }, 'Preferência atualizada.')} />
              <span className="care-switch-track" aria-hidden="true" />
            </label>
          ))}
          <div className="care-font-setting"><strong>Tamanho da fonte</strong><div className="care-font-options">
            {(['Médio', 'Pequeno', 'Grande'] as const).map((opcao) => (
              <button type="button" key={opcao} className={perfil.fonte === opcao ? 'selected' : ''}
                aria-pressed={perfil.fonte === opcao} onClick={() => escolherFonte(opcao)}>{opcao}</button>
            ))}
          </div></div>
          <p className="care-setting-hint">Preferências salvas apenas neste navegador. Não enviamos notificações reais.</p>
        </section>

        <h2 className="care-section-title">Sobre o App</h2>
        <section className="care-card care-about-card">
          <div className="care-about-row"><strong>Versão</strong><span>1.0.0</span></div>
          {['Suporte ao usuário', 'Política de privacidade', 'Termos de uso'].map((titulo) => (
            <button type="button" key={titulo} className="care-about-row" onClick={() => setEdicao({ tipo: 'sobre', titulo })}>
              <strong>{titulo}</strong><VidaIcon nome="seta" tamanho={19} />
            </button>
          ))}
        </section>
        <button type="button" className="care-logout" onClick={sair}><VidaIcon nome="sair" tamanho={20} /> Sair do Aplicativo</button>
      </div>

      {edicao && (
        <div className="care-modal-overlay" onMouseDown={(e) => { if (e.currentTarget === e.target) setEdicao(null); }}>
          <section className="care-modal" role="dialog" aria-modal="true" aria-labelledby="perfil-modal-titulo">
            <button className="care-modal-close" type="button" onClick={() => setEdicao(null)} aria-label="Fechar">×</button>
            {edicao.tipo === 'sobre' ? <>
              <h2 id="perfil-modal-titulo">{edicao.titulo}</h2>
              <p>Versão de demonstração acadêmica do VidaSaúde. Os dados ficam no navegador, sem integração com servidores, contatos ou serviços externos.</p>
              <button type="button" className="care-btn-primary" onClick={() => setEdicao(null)}>Entendi</button>
            </> : <form onSubmit={salvarEdicao} noValidate>
              <h2 id="perfil-modal-titulo">{edicao.tipo === 'campo' ? `Editar ${rotulos[edicao.chave]}` : edicao.id ? 'Editar Médico' : 'Adicionar Médico'}</h2>
              {edicao.tipo === 'campo' ? (
                <label className="care-modal-label">{rotulos[edicao.chave]}
                  {edicao.chave === 'tipoSanguineo' ? (
                    <select value={valor} onChange={(e) => setValor(e.target.value)}>
                      {['O Positivo (O+)', 'O Negativo (O-)', 'A Positivo (A+)', 'A Negativo (A-)', 'B Positivo (B+)', 'B Negativo (B-)', 'AB Positivo (AB+)', 'AB Negativo (AB-)','Não sei'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  ) : edicao.chave === 'alergias' || edicao.chave === 'condicoes' ? (
                    <textarea value={valor} rows={3} onChange={(e) => setValor(e.target.value)} />
                  ) : (
                    <input type={edicao.chave === 'dataNascimento' ? 'date' : edicao.chave === 'telefone' || edicao.chave === 'contatoTelefone' ? 'tel' : 'text'}
                      value={valor} onChange={(e) => setValor(edicao.chave === 'telefone' || edicao.chave === 'contatoTelefone' ? formatarTelefone(e.target.value) : e.target.value)} />
                  )}
                </label>
              ) : <>
                <label className="care-modal-label">Nome do médico<input value={nomeMedico} onChange={(e) => setNomeMedico(e.target.value)} placeholder="Ex: Dra. Ana Lima" /></label>
                <label className="care-modal-label">Especialidade<input value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} placeholder="Ex: Cardiologista" /></label>
                <label className="care-modal-label">Telefone<input type="tel" value={telefoneMedico} onChange={(e) => setTelefoneMedico(formatarTelefone(e.target.value))} placeholder="(11) 99999-9999" /></label>
              </>}
              {erro && <p className="care-modal-error" role="alert">{erro}</p>}
              <div className="care-modal-actions"><button type="button" className="care-btn-outline" onClick={() => setEdicao(null)}>Cancelar</button>
                <button type="submit" className="care-btn-primary">Salvar</button></div>
            </form>}
          </section>
        </div>
      )}
    </CareShell>
  );
}
