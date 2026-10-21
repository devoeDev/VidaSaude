import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from './MobileAppShell';
import VidaIcon, { type NomeIcone } from './VidaIcon';
import { lerPerfil } from '../data/perfil';
import '../pages/CarePages.css';

type Menu = 'inicio' | 'saude' | 'medicamentos' | 'horarios';
const ITENS: { id: Menu; titulo: string; icone: NomeIcone; rota: string }[] = [
  { id: 'inicio', titulo: 'Início', icone: 'inicio', rota: '/inicio' },
  { id: 'saude', titulo: 'Saúde', icone: 'saude', rota: '/saude' },
  { id: 'medicamentos', titulo: 'Remédio', icone: 'remedio', rota: '/medicamentos' },
  { id: 'horarios', titulo: 'Alertas', icone: 'alertas', rota: '/horarios' },
];

export default function CareShell({ children, active, header, headerClass = '', className = '', back }: {
  children: ReactNode; active?: Menu; header: ReactNode; headerClass?: string;
  className?: string; back?: string;
}) {
  const navigate = useNavigate();
  const perfil = lerPerfil();
  return (
    <MobileAppShell className={`care-screen care-font-${perfil.fonte === 'Grande' ? 'large' : perfil.fonte === 'Pequeno' ? 'small' : 'medium'} ${className}`}>
      <div className="care-layout">
        <aside className="care-sidebar" aria-label="Navegação principal">
          <div className="care-brand"><span className="care-brand-symbol"><VidaIcon nome="saude" tamanho={22} preenchido /></span> VidaSaúde</div>
          <p>Cuidando de você com carinho</p>
          <span className="care-menu-title">MENU PRINCIPAL</span>
          <nav className="care-side-links">
            {ITENS.map((item) => (
              <button key={item.id} type="button" className={active === item.id ? 'selected' : ''} onClick={() => navigate(item.rota)}>
                <VidaIcon nome={item.icone} tamanho={22} />
                {item.id === 'medicamentos' ? 'Medicamentos' : item.titulo}
              </button>
            ))}
          </nav>
          <button type="button" className="care-side-profile" onClick={() => navigate('/perfil')}>
            <span className="care-profile-letter">{perfil.nome[0]?.toUpperCase() || 'M'}</span>
            <span><strong>{perfil.nome}</strong><small>Meu perfil</small></span>
          </button>
        </aside>
        <div className="care-main-area">
          <header className={`care-hero ${headerClass}`}>
            {back && <button type="button" className="care-back" onClick={() => navigate(back)}><VidaIcon nome="voltar" tamanho={20} /> Voltar</button>}
            {header}
          </header>
          <main className="care-content">{children}</main>
        </div>
        <nav className="care-bottom-nav" aria-label="Menu inferior">
          {ITENS.map((item) => (
            <button key={item.id} type="button" className={active === item.id ? 'selected' : ''}
              aria-current={active === item.id ? 'page' : undefined} onClick={() => navigate(item.rota)}>
              <VidaIcon nome={item.icone} tamanho={23} preenchido={active === item.id && item.id === 'saude'} />
              <span>{item.titulo}</span>
            </button>
          ))}
        </nav>
      </div>
    </MobileAppShell>
  );
}
