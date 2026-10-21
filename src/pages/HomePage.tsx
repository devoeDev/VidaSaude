import { finalizarSessao } from '../data/portal';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../components/MobileAppShell';
import VidaIcon, { type NomeIcone } from '../components/VidaIcon';
import {
  CONFIG, TIPOS, dataCompleta, formatarValor, lerMedicoes,
  statusDemonstrativo, ultimaMedicao, type TipoMedicao,
} from '../data/medicoes';
import { lerAgenda, proximoLembrete, totalConcluidos, AGENDA } from '../data/medicamentos';
import { lerPerfil } from '../data/perfil';
import './HomePage.css';

type Secao = 'inicio' | 'saude' | 'medicamentos' | 'alertas';
const ICONES: Record<TipoMedicao, NomeIcone> = {
  glicose: 'gota', pressao: 'pressao', batimentos: 'batimentos',
};
const MENU: { id: Secao; texto: string; icone: NomeIcone; rota: string }[] = [
  { id: 'inicio', texto: 'Início', icone: 'inicio', rota: '/inicio' },
  { id: 'saude', texto: 'Saúde', icone: 'saude', rota: '/saude' },
  { id: 'medicamentos', texto: 'Remédio', icone: 'remedio', rota: '/medicamentos' },
  { id: 'alertas', texto: 'Alertas', icone: 'alertas', rota: '/horarios' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(lerPerfil);
  const [medicoes, setMedicoes] = useState(lerMedicoes);
  const [agenda, setAgenda] = useState(lerAgenda);

  useEffect(() => {
    function atualizar() {
      setPerfil(lerPerfil());
      setMedicoes(lerMedicoes());
      setAgenda(lerAgenda());
    }
    window.addEventListener('vida-saude-medicoes-atualizadas', atualizar);
    window.addEventListener('vida-saude-agenda-atualizada', atualizar);
    window.addEventListener('vida-saude-perfil-atualizado', atualizar);
    return () => {
      window.removeEventListener('vida-saude-medicoes-atualizadas', atualizar);
      window.removeEventListener('vida-saude-agenda-atualizada', atualizar);
      window.removeEventListener('vida-saude-perfil-atualizado', atualizar);
    };
  }, []);

  const nome = perfil.nome;
  const inicial = nome[0]?.toUpperCase() || 'M';
  const proximo = proximoLembrete(agenda);
  const total = totalConcluidos(agenda);
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia,' : hora < 18 ? 'Boa tarde,' : 'Boa noite,';

  function sair() {
    finalizarSessao();
    navigate('/login', { replace: true });
  }

  return (
    <MobileAppShell className="home-screen">
      <div className="home-app">
        <aside className="home-sidebar" aria-label="Menu principal">
          <div className="home-sidebar-brand">
            <span className="home-sidebar-symbol"><VidaIcon nome="saude" tamanho={24} preenchido /></span>
            <span>VidaSaúde</span>
          </div>
          <p className="home-sidebar-caption">Cuidando de você com carinho</p>
          <div className="home-sidebar-group-label">MENU PRINCIPAL</div>
          <nav className="home-side-nav">
            {MENU.map((item) => (
              <button key={item.id} type="button" onClick={() => navigate(item.rota)}
                className={`home-side-link ${item.id === 'inicio' ? 'is-active' : ''}`}>
                <VidaIcon nome={item.icone} tamanho={23} />
                {item.id === 'medicamentos' ? 'Medicamentos' : item.texto}
              </button>
            ))}
          </nav>
          <button type="button" className="home-side-link" style={{ marginTop: 8 }} onClick={() => navigate('/portal')}>
            <VidaIcon nome="usuario" tamanho={23} /> Visitas e atividades
          </button>
          <div className="home-sidebar-bottom">
            <button type="button" className="home-sidebar-user" onClick={() => navigate('/perfil')}>
              <span className="home-sidebar-avatar">{inicial}</span>
              <span><strong>{nome}</strong><small>Meu perfil</small></span>
            </button>
            <button type="button" className="home-sidebar-logout" onClick={sair}>
              <VidaIcon nome="sair" tamanho={18} /> Sair da demonstração
            </button>
          </div>
        </aside>

        <main className="home-main">
          <header className="home-hero">
            <div className="home-greeting">
              <p className="home-salutation">{saudacao}</p>
              <h1>{nome}</h1>
              <p className="home-date">{dataCompleta()}</p>
            </div>
            <button type="button" className="home-avatar" onClick={() => navigate('/perfil')}
              aria-label="Abrir meu perfil">{inicial}</button>
            <p className="home-desktop-subtitle">Acompanhe suas medições, atividades e cuidados do dia.</p>
          </header>
          <div className="home-content">
            <section className="home-health-card" aria-labelledby="titulo-medicoes">
              <div className="home-card-top">
                <h2 id="titulo-medicoes">Últimas Medições</h2>
                <button type="button" className="home-all-measures" onClick={() => navigate('/saude')}>
                  Ver detalhes <VidaIcon nome="seta" tamanho={17} />
                </button>
              </div>
              <div className="home-vitals">
                {TIPOS.map((tipo) => {
                  const registro = ultimaMedicao(medicoes, tipo);
                  const status = registro ? statusDemonstrativo(registro) : '—';
                  return (
                    <button key={tipo} type="button" className={`home-vital home-vital-${tipo}`}
                      onClick={() => navigate(`/saude/historico?tipo=${tipo}`)}
                      aria-label={`Ver histórico de ${CONFIG[tipo].nome}`}>
                      <span className="home-vital-icon"><VidaIcon nome={ICONES[tipo]} tamanho={19} preenchido={tipo !== 'pressao'} /></span>
                      <strong>{registro ? formatarValor(registro) : '—'}</strong>
                      <small>{CONFIG[tipo].unidade}</small>
                      <span className="home-vital-status" style={status === 'Normal' ? { background: '#dafaac', color: '#287f19' } : undefined}>{status}</span>
                    </button>
                  );
                })}
              </div>
              <p className="home-demo-caption">Medições de demonstração e registros locais.</p>
            </section>

            <div className="home-dashboard-grid">
              <div className="home-primary-column">
                <button type="button" className={`home-reminder ${proximo ? '' : 'home-reminder-done'}`}
                  onClick={() => navigate('/horarios')}>
                  <span className="home-reminder-icon"><VidaIcon nome={proximo ? 'aviso' : 'check'} tamanho={31} /></span>
                  <span className="home-reminder-content">
                    <span className="home-reminder-heading">{proximo ? 'Próximo Lembrete' : 'Lembretes concluídos'}</span>
                    <strong>{proximo?.hora ?? 'Tudo em dia!'}</strong>
                    <span>{proximo ? proximo.itens.map((m) => `${m.nome} ${m.dose}`).join(' · ') : 'Todos os horários concluídos'}</span>
                  </span>
                  <VidaIcon nome="seta" tamanho={24} />
                </button>
                <section className="home-actions" aria-labelledby="titulo-acoes">
                  <h2 id="titulo-acoes">O que você quer fazer?</h2>
                  <div className="home-action-list">
                    <button type="button" className="home-action-card" onClick={() => navigate('/saude')}>
                      <span className="home-action-icon home-action-health"><VidaIcon nome="saude" preenchido tamanho={25} /></span>
                      <span className="home-action-copy"><strong>Minha Saúde</strong><span>Glicose · Pressão · Batimentos</span></span>
                      <VidaIcon nome="seta" tamanho={24} />
                    </button>
                    <button type="button" className="home-action-card" onClick={() => navigate('/medicamentos')}>
                      <span className="home-action-icon home-action-medicine"><VidaIcon nome="remedio" tamanho={25} /></span>
                      <span className="home-action-copy"><strong>Medicamentos</strong><span>Horários · Lembretes</span></span>
                      <VidaIcon nome="seta" tamanho={24} />
                    </button>
                    <button type="button" className="home-action-card" onClick={() => navigate('/portal')}>
                      <span className="home-action-icon home-action-health"><VidaIcon nome="usuario" tamanho={25} /></span>
                      <span className="home-action-copy"><strong>Visitas e Atividades</strong><span>Família · Amigos · Rotina</span></span>
                      <VidaIcon nome="seta" tamanho={24} />
                    </button>
                  </div>
                </section>
              </div>
              <aside className="home-desktop-extras" aria-label="Resumo do dia">
                <section className="home-extra-card">
                  <div className="home-extra-title"><VidaIcon nome="relogio" /><h2>Sua rotina de hoje</h2></div>
                  <p>Você concluiu {total} de {AGENDA.length} horários de medicamentos.</p>
                  <div className="home-routine-row">
                    <span className="home-routine-time">{proximo?.hora ?? '✓'}</span>
                    <span>{proximo ? proximo.itens.map((m) => `${m.nome} ${m.dose}`).join(' · ') : 'Tudo concluído'}</span>
                    <span className={proximo ? 'home-routine-pending' : 'home-routine-done'}>{proximo ? 'Pendente' : 'Tomado'}</span>
                  </div>
                  <button type="button" className="home-extra-link" onClick={() => navigate('/horarios')}>
                    Ver alertas <VidaIcon nome="seta" tamanho={17} />
                  </button>
                </section>
                <section className="home-extra-card home-extra-tip">
                  <h2>Seu bem-estar em primeiro lugar</h2>
                  <p>Tenha suas informações de saúde organizadas e seus lembretes sempre à mão.</p>
                </section>
              </aside>
            </div>
          </div>
        </main>
        <nav className="home-bottom-nav" aria-label="Navegação inferior">
          {MENU.map((item) => (
            <button key={item.id} type="button" onClick={() => navigate(item.rota)}
              className={`home-nav-link ${item.id === 'inicio' ? 'is-active' : ''}`}
              aria-current={item.id === 'inicio' ? 'page' : undefined}>
              <VidaIcon nome={item.icone} tamanho={23} preenchido={item.id === 'saude'} />
              <span>{item.texto}</span>
            </button>
          ))}
        </nav>
        <button type="button" className="home-sos-button" onClick={() => navigate('/sos')} aria-label="Abrir SOS">SOS</button>
      </div>
    </MobileAppShell>
  );
}
