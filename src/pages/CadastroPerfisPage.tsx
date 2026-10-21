import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../components/MobileAppShell';
import { formatarTelefone, telefoneValido } from '../utils/telefone';
import { cadastrarConta, caminhoInicial, iniciarSessao, PAPEIS, type Papel } from '../data/portal';
import './PortalPage.css';

type PapelCadastro = Exclude<Papel, 'idoso'>;

export default function CadastroPerfisPage() {
  const navigate = useNavigate();
  const [papel, setPapel] = useState<PapelCadastro>('visitante');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [vinculo, setVinculo] = useState('');
  const [aceitou, setAceitou] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState<{ id: string; nome: string; papel: Papel } | null>(null);

  function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    if (nome.trim().split(/\s+/).length < 2) return setErro('Informe nome e sobrenome.');
    if (!telefoneValido(telefone)) return setErro('Informe um telefone válido com DDD.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErro('Informe um e-mail válido.');
    if (papel !== 'cuidador' && vinculo.trim().length < 3) return setErro('Descreva o vínculo com a pessoa residente.');
    if (!aceitou) return setErro('Confirme que este é um cadastro fictício para demonstração.');
    try {
      const conta = cadastrarConta({ nome: nome.trim(), papel, telefone, email: email.trim(), vinculo: vinculo.trim() || 'Profissional em cadastro' });
      setSucesso(conta);
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível cadastrar.'); }
  }

  function acessarConta() {
    if (!sucesso) return;
    const conta = iniciarSessao(sucesso.id);
    navigate(caminhoInicial(conta), { replace: true });
  }

  return <MobileAppShell className="portal-screen">
    <main className="portal-register">
      <header className="portal-register-header">
        <button type="button" onClick={() => navigate('/login')}>← Voltar ao login</button>
        <h1>Cadastre seu perfil</h1>
        <p>VidaSaúde · perfis de visitante, familiar e cuidador.</p>
      </header>
      <section className="portal-register-card" aria-label="Cadastro demonstrativo">
        {sucesso ? <>
          <h2>✓ Perfil criado com sucesso</h2>
          <p>Olá, {sucesso.nome}! Seu cadastro de <strong>{PAPEIS[sucesso.papel]}</strong> foi guardado apenas neste navegador.</p>
          <p>{sucesso.papel === 'cuidador' ? 'O perfil de cuidador recém-criado ficará com permissão de análise bloqueada até uma validação que não existe neste protótipo. Use a conta de demonstração Ana Lima para testar aprovações.' : 'Você pode entrar e, se for o caso, solicitar uma visita. O vínculo declarado ainda precisará ser analisado na simulação.'}</p>
          <button type="button" className="portal-primary" onClick={acessarConta}>Entrar neste perfil →</button>
          <button type="button" className="portal-outline" onClick={() => navigate('/login')}>Voltar ao login</button>
        </> : <>
          <h2>Que tipo de perfil deseja criar?</h2>
          <p>Escolha o acesso que será usado na apresentação da faculdade.</p>
          <form onSubmit={cadastrar} noValidate>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontWeight: 900, margin: '12px 0' }}>Tipo de acesso</legend>
              <div className="portal-role-selection">{(['visitante', 'familiar', 'cuidador'] as const).map((opcao) => <label key={opcao}><input type="radio" name="papel" value={opcao} checked={papel === opcao} onChange={() => { setPapel(opcao); setErro(''); }} />{PAPEIS[opcao]}</label>)}</div>
            </fieldset>
            <div className="portal-register-grid">
              <label>Nome completo<input autoComplete="name" maxLength={100} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome e sobrenome" /></label>
              <label>Telefone<input type="tel" autoComplete="tel" value={telefone} maxLength={15} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} placeholder="(79) 99999-9999" /></label>
              <label>E-mail<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" /></label>
              <label>{papel === 'cuidador' ? 'Função / experiência (opcional)' : 'Qual seu vínculo com o idoso?'}<input value={vinculo} maxLength={90} onChange={(e) => setVinculo(e.target.value)} placeholder={papel === 'cuidador' ? 'Cuidador(a) da instituição' : 'Ex.: neto(a), amigo(a), irmã(o)'} /></label>
            </div>
            <label className="portal-check"><input type="checkbox" checked={aceitou} onChange={(e) => setAceitou(e.target.checked)} /><span>Entendo que se trata de um cadastro fictício, sem identificação, autenticação ou verificação profissional real. Não usarei dados reais sensíveis.</span></label>
            {erro && <div role="alert" className="portal-message portal-error" style={{ marginTop: 14 }}>{erro}</div>}
            <button type="submit" className="portal-primary">Criar perfil</button>
          </form>
          <div className="portal-demo-picker"><p>Perfil de idoso? Utilize o cadastro original do aplicativo.</p><button type="button" onClick={() => navigate('/cadastro')}>Ir para cadastro do idoso</button></div>
        </>}
      </section>
    </main>
  </MobileAppShell>;
}
