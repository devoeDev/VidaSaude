import { useNavigate } from 'react-router-dom';
import VidaSaudeLogo from '../components/VidaSaudeLogo';

/** Esta tela temporária será substituída pelo login enviado do Figma. */
export default function LoginPlaceholderPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-brand-white px-6 py-12">
      <div className="flex w-full max-w-[390px] flex-col items-center text-center">
        <div className="mb-5"><VidaSaudeLogo size="small" /></div>
        <p className="mb-2 text-sm font-bold tracking-wide text-brand-primary uppercase">
          VidaSaúde
        </p>
        <h1 className="text-3xl font-black text-brand-ink">Próxima tela: Login</h1>
        <p className="mt-4 max-w-[300px] text-base leading-relaxed text-brand-muted">
          A tela de abertura foi concluída. Este espaço será substituído pelo login do Figma
          quando recebermos o próximo design.
        </p>
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="mt-8 min-h-12 w-full cursor-pointer rounded-xl bg-brand-primary px-6 py-3 text-base font-extrabold text-white transition-colors hover:bg-brand-primary-dark focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand-heart"
        >
          Rever tela de abertura
        </button>
      </div>
    </main>
  );
}
