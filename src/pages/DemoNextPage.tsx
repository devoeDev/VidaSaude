import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../components/MobileAppShell';
import VidaSaudeLogo from '../components/VidaSaudeLogo';

type DemoNextPageProps = { pagina: 'cadastro' | 'inicio' };

/** Destinos temporários até a chegada dos próximos layouts do Figma. */
export default function DemoNextPage({ pagina }: DemoNextPageProps) {
  const navigate = useNavigate();
  const cadastro = pagina === 'cadastro';

  return (
    <MobileAppShell className="flex flex-col bg-brand-white">
      <main className="flex min-h-full flex-1 flex-col items-center justify-center px-7 py-12 text-center">
        <VidaSaudeLogo size="small" />
        <p className="mt-5 text-[14px] font-extrabold text-brand-primary">VidaSaúde</p>
        <h1 className="mt-3 text-[25px] leading-tight font-black text-[#303030]">
          {cadastro ? 'Próxima tela: Cadastro' : 'Bem-vindo(a) ao VidaSaúde!'}
        </h1>
        <p className="mt-4 max-w-[320px] text-[15px] leading-6 text-[#53645b]">
          {cadastro
            ? 'O botão de cadastro já está conectado. Vamos construir esta tela quando você enviar o próximo layout do Figma.'
            : 'Login demonstrativo realizado com sucesso. Vamos construir a tela inicial quando você enviar seu layout do Figma.'}
        </p>
        <div className="mt-4 rounded-lg bg-[#e8f3ec] px-4 py-3 text-[13px] leading-5 text-[#376150]">
          Versão de apresentação: sem autenticação real, servidor ou banco de dados.
        </div>
        <button
          type="button"
          className="mt-8 min-h-[50px] w-full max-w-[320px] cursor-pointer rounded-lg bg-brand-primary px-5 text-[16px] font-extrabold text-white hover:bg-brand-primary-dark"
          onClick={() => navigate('/login')}
        >
          Voltar ao login
        </button>
      </main>
    </MobileAppShell>
  );
}
