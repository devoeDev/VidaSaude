import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../components/MobileAppShell';
import VidaSaudeLogo from '../components/VidaSaudeLogo';

const TEMPO_DE_EXIBICAO_MS = 2500;

export default function SplashPage() {
  const navigate = useNavigate();
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const inicioDaSaida = window.setTimeout(() => setSaindo(true), TEMPO_DE_EXIBICAO_MS - 300);
    const temporizador = window.setTimeout(() => navigate('/login', { replace: true }), TEMPO_DE_EXIBICAO_MS);
    return () => {
      window.clearTimeout(inicioDaSaida);
      window.clearTimeout(temporizador);
    };
  }, [navigate]);

  return (
    <MobileAppShell className="bg-brand-primary">
      <main
        className={`flex min-h-full flex-1 items-center justify-center overflow-hidden bg-brand-primary transition-opacity duration-300 ease-in ${saindo ? 'opacity-0' : 'opacity-100'}`}
        aria-label="Carregando VidaSaúde"
      >
        <div className="splash-entrada flex -translate-y-[9.5dvh] flex-col items-center gap-[24px]">
          <VidaSaudeLogo />
          <h1 className="text-[30px] leading-[1.15] font-black tracking-[0.1px] text-brand-white">VidaSaúde</h1>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          Abrindo o aplicativo VidaSaúde. Aguarde um instante.
        </span>
      </main>
    </MobileAppShell>
  );
}
