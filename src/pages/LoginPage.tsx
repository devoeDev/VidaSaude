import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import EyeIcon from '../components/EyeIcon';
import MobileAppShell from '../components/MobileAppShell';
import VidaSaudeLogo from '../components/VidaSaudeLogo';
import { formatarTelefone, telefoneValido } from '../utils/telefone';
import { caminhoInicial, iniciarSessao, listarContas, PAPEIS } from '../data/portal';

type Erros = { telefone?: string; senha?: string };

/** Tela 02 — Login, reproduzindo o layout encaminhado do Figma. */
export default function LoginPage() {
  const navigate = useNavigate();
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarPerfis, setMostrarPerfis] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [entrando, setEntrando] = useState(false);
  const [recuperacaoAberta, setRecuperacaoAberta] = useState(false);
  const [telefoneRecuperacao, setTelefoneRecuperacao] = useState('');
  const [erroRecuperacao, setErroRecuperacao] = useState('');
  const [confirmacaoRecuperacao, setConfirmacaoRecuperacao] = useState(false);
  const tempoEntrada = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tempoEntrada.current) clearTimeout(tempoEntrada.current);
    };
  }, []);

  useEffect(() => {
    if (!recuperacaoAberta) return;
    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setRecuperacaoAberta(false);
    };
    document.addEventListener('keydown', aoPressionarTecla);
    return () => document.removeEventListener('keydown', aoPressionarTecla);
  }, [recuperacaoAberta]);

  function efetuarLogin(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (entrando) return;
    const novosErros: Erros = {};

    if (!telefoneValido(telefone)) {
      novosErros.telefone = 'Informe um telefone com DDD e 10 ou 11 dígitos.';
    }
    if (senha.trim().length < 6) {
      novosErros.senha = 'Informe uma senha de pelo menos 6 caracteres.';
    }
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setEntrando(true);
    // Demonstração frontend: apenas registra que a apresentação foi iniciada.
    // A senha NÃO é salva ou enviada a lugar algum.
    try { sessionStorage.setItem('vida-saude-demo', 'usuario'); } catch { /* demo sem persistência */ }
    const conta = iniciarSessao('demo-idoso');
    tempoEntrada.current = setTimeout(() => {
      navigate(caminhoInicial(conta), { replace: true });
    }, 650);
  }

  function entrarComo(id: string) {
    const conta = iniciarSessao(id);
    navigate(caminhoInicial(conta), { replace: true });
  }

  function solicitarRecuperacao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!telefoneValido(telefoneRecuperacao)) {
      setErroRecuperacao('Informe um telefone válido com DDD.');
      return;
    }
    setErroRecuperacao('');
    setConfirmacaoRecuperacao(true);
  }

  function abrirRecuperacao() {
    setTelefoneRecuperacao(telefone);
    setErroRecuperacao('');
    setConfirmacaoRecuperacao(false);
    setRecuperacaoAberta(true);
  }

  return (
    <MobileAppShell className={`login-screen ${mostrarPerfis ? 'role-open' : ''}`}>
      <main className="flex min-h-full flex-col" aria-label="Entrar no VidaSaúde">
        <header className="login-hero">
          <VidaSaudeLogo size="small" />
          <h1 className="mt-[23px] text-center text-[30px] leading-[1.2] font-black tracking-[0.1px] text-brand-white">
            VidaSaúde
          </h1>
          <p className="mt-[6px] text-center text-[14px] leading-[20px] font-medium text-brand-white">
            Cuidando de você com carinho
          </p>
        </header>

        <section className="login-panel" aria-labelledby="titulo-login">
          <h2 id="titulo-login" className="mb-[28px] text-[22px] leading-[29px] font-black text-[#303030]">
            Bem-vindo(a)!
          </h2>

          <form onSubmit={efetuarLogin} noValidate>
            <div>
              <label className="login-label" htmlFor="telefone-login">Telefone</label>
              <input
                id="telefone-login"
                name="telefone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(event) => {
                  setTelefone(formatarTelefone(event.target.value));
                  setErros((atual) => ({ ...atual, telefone: undefined }));
                }}
                aria-invalid={Boolean(erros.telefone)}
                aria-describedby={erros.telefone ? 'erro-telefone' : undefined}
                className={`login-input ${erros.telefone ? 'login-input-error' : ''}`}
                maxLength={15}
              />
              {erros.telefone && <p id="erro-telefone" role="alert" className="login-error">{erros.telefone}</p>}
            </div>

            <div className="mt-[10px]">
              <label className="login-label" htmlFor="senha-login">Senha</label>
              <div className="relative">
                <input
                  id="senha-login"
                  name="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="***********"
                  value={senha}
                  onChange={(event) => {
                    setSenha(event.target.value);
                    setErros((atual) => ({ ...atual, senha: undefined }));
                  }}
                  aria-invalid={Boolean(erros.senha)}
                  aria-describedby={erros.senha ? 'erro-senha' : undefined}
                  className={`login-input pr-[52px] ${erros.senha ? 'login-input-error' : ''}`}
                />
                <button
                  type="button"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={mostrarSenha}
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute top-0 right-[4px] flex h-[48px] w-[42px] cursor-pointer items-center justify-center rounded-lg text-[#777a75] hover:text-brand-primary focus-visible:outline-3 focus-visible:outline-brand-primary"
                >
                  <EyeIcon visible={mostrarSenha} />
                </button>
              </div>
              {erros.senha && <p id="erro-senha" role="alert" className="login-error">{erros.senha}</p>}
            </div>

            <div className="mt-[9px] text-right">
              <button
                type="button"
                onClick={abrirRecuperacao}
                className="cursor-pointer rounded text-[13px] leading-[20px] font-extrabold text-brand-primary hover:underline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-primary"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={entrando}
              className="mt-[18px] flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-brand-primary px-4 text-[17px] font-extrabold text-brand-white transition-colors hover:bg-brand-primary-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-heart disabled:cursor-wait disabled:opacity-70"
            >
              {entrando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/cadastro')}
            className="mt-[38px] flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-[8px] border-[3px] border-brand-primary bg-transparent px-4 text-[17px] font-extrabold text-brand-primary transition-colors hover:bg-brand-primary/5 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-heart"
          >
            Se Cadastrar
          </button>

          <div className="login-demo-zone">
            <button className="login-demo-toggle" type="button" aria-expanded={mostrarPerfis}
              onClick={() => setMostrarPerfis((v) => !v)}>
              {mostrarPerfis ? 'Ocultar perfis de apresentação' : 'Acessar outros perfis de demonstração'}
            </button>
            {mostrarPerfis && <div className="login-role-grid" aria-label="Escolher perfil demonstrativo">
              {listarContas().map((conta) => (
                <button type="button" key={conta.id} className="login-role-button" onClick={() => entrarComo(conta.id)}>
                  <span className="login-role-avatar">{conta.nome[0]?.toUpperCase()}</span>
                  <span><strong>{conta.nome}</strong><small>{PAPEIS[conta.papel]}{conta.situacao === 'pendente' ? ' · cadastro pendente' : ''}</small></span>
                  <span aria-hidden="true">→</span>
                </button>
              ))}
              <button type="button" className="login-role-register" onClick={() => navigate('/cadastro-perfis')}>
                + Cadastrar visitante, familiar ou cuidador
              </button>
              <p className="login-demo-disclaimer">Acesso rápido fictício para apresentação; não valida senhas nem identidades.</p>
            </div>}
          </div>
        </section>
      </main>

      {recuperacaoAberta && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setRecuperacaoAberta(false); }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="recuperacao-titulo">
            <button
              type="button"
              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg text-[#4f685f] hover:bg-black/5"
              onClick={() => setRecuperacaoAberta(false)}
              aria-label="Fechar"
            >
              <span aria-hidden="true" className="text-2xl leading-none">×</span>
            </button>
            <h2 id="recuperacao-titulo" className="pr-8 text-[21px] font-black text-[#303030]">
              Recuperar senha
            </h2>
            {confirmacaoRecuperacao ? (
              <div className="mt-4">
                <p role="status" className="text-[15px] leading-6 text-[#394e45]">
                  Solicitação simulada com sucesso! Nenhum SMS foi enviado, pois este aplicativo é uma demonstração sem backend.
                </p>
                <button type="button" className="modal-primary mt-6" onClick={() => setRecuperacaoAberta(false)}>
                  Entendi
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={solicitarRecuperacao} className="mt-4">
                <p className="mb-4 text-[14px] leading-6 text-[#52665d]">
                  Informe seu telefone para simular uma solicitação de recuperação de senha.
                </p>
                <label htmlFor="telefone-recuperacao" className="login-label">Telefone</label>
                <input
                  id="telefone-recuperacao"
                  autoFocus
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  value={telefoneRecuperacao}
                  onChange={(event) => {setTelefoneRecuperacao(formatarTelefone(event.target.value)); setErroRecuperacao('');}}
                  className={`login-input ${erroRecuperacao ? 'login-input-error' : ''}`}
                />
                {erroRecuperacao && <p className="login-error" role="alert">{erroRecuperacao}</p>}
                <button type="submit" className="modal-primary mt-5">
                  Continuar
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </MobileAppShell>
  );
}
