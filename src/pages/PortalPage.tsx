import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileAppShell from '../components/MobileAppShell';
import VidaIcon from '../components/VidaIcon';
import { lerPerfil } from '../data/perfil';
import { CONFIG, formatarValor, lerMedicoes, ultimaMedicao, type TipoMedicao } from '../data/medicoes';
import { AGENDA, lerAgenda, totalConcluidos } from '../data/medicamentos';
import {
  caminhoInicial, finalizarSessao, lerSessao, PAPEIS, podeAprovarVisitas,
  podeSolicitarVisita, type Conta,
} from '../data/portal';
import {
  cancelarVisita, conferirVinculo, dataLocal, dataVisita, decidirVisita,
  EVENTO_VISITAS, lerVisitas, ROTULOS_STATUS, solicitarVisita,
  visitasVisiveis, type DadosPedido, type Visita,
} from '../data/visitas';
import './PortalPage.css';

type Aba = 'resumo' | 'visitas' | 'solicitar' | 'atividades';
type Decisao = { id: string; tipo: 'aprovar' | 'recusar' | 'cancelar' | 'conferir' } | null;

const ATIVIDADES = [
  { id: '1', hora: '09:00', nome: 'Alongamento e movimento', local: 'Sala de atividades', detalhe: 'Movimentos leves acompanhados por cuidadores.' },
  { id: '2', hora: '14:00', nome: 'Oficina de memória', local: 'Sala de convivência', detalhe: 'Jogos e atividades de atenção.' },
  { id: '3', hora: '16:00', nome: 'Roda de conversa', local: 'Jardim', detalhe: 'Convívio social e recreação.' },
];

const PEDIDO_INICIAL: DadosPedido = {
  relacao: '', comprovacao: '', declarado: false, data: dataLocal(1), hora: '15:00', observacoes: '',
};

function rotaAba(caminho: string): Aba {
  if (caminho.endsWith('/solicitar')) return 'solicitar';
  if (caminho.endsWith('/visitas')) return 'visitas';
  if (caminho.endsWith('/atividades')) return 'atividades';
  return 'resumo';
}

function Status({ visita }: { visita: Visita }) {
  return <span className={`portal-status portal-status-${visita.status}`}>{ROTULOS_STATUS[visita.status]}</span>;
}

export default function PortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [conta] = useState<Conta>(lerSessao);
  const [visitas, setVisitas] = useState(lerVisitas);
  const [pedido, setPedido] = useState<DadosPedido>(PEDIDO_INICIAL);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [protocolo, setProtocolo] = useState('');
  const [decisao, setDecisao] = useState<Decisao>(null);
  const [justificativa, setJustificativa] = useState('');
  const [participacoes, setParticipacoes] = useState<string[]>(() => {
    try {
      const registros: unknown = JSON.parse(localStorage.getItem('vida-saude-atividades-v1') ?? '[]');
      return Array.isArray(registros) ? registros.filter((v): v is string => typeof v === 'string') : [];
    } catch { return []; }
  });

  const aba = rotaAba(location.pathname);
  const gestor = podeAprovarVisitas(conta);
  const solicitante = podeSolicitarVisita(conta);
  const lista = useMemo(() => visitasVisiveis(conta, visitas).sort((a, b) => a.data.localeCompare(b.data)), [conta, visitas]);
  const pendentes = lista.filter((v) => v.status === 'pendente').length;
  const aprovadas = lista.filter((v) => v.status === 'aprovada').length;

  useEffect(() => {
    const atualizar = () => setVisitas(lerVisitas());
    window.addEventListener(EVENTO_VISITAS, atualizar);
    window.addEventListener('storage', atualizar);
    return () => {
      window.removeEventListener(EVENTO_VISITAS, atualizar);
      window.removeEventListener('storage', atualizar);
    };
  }, []);

  function navegar(caminho: string) {
    setErro('');
    setAviso('');
    setProtocolo('');
    navigate(caminho);
  }

  function sair() {
    finalizarSessao();
    navigate('/login', { replace: true });
  }

  function enviarPedido(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    try {
      const visita = solicitarVisita(conta, pedido, lerPerfil().nome);
      setPedido({ ...PEDIDO_INICIAL, data: dataLocal(1) });
      setProtocolo(visita.id);
      setAviso('Solicitação recebida! Ela ficará pendente até a análise demonstrativa do cuidador.');
      navigate('/portal/visitas');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar sua solicitação.');
    }
  }

  function confirmarAcao() {
    if (!decisao) return;
    try {
      if (decisao.tipo === 'conferir') conferirVinculo(conta, decisao.id);
      if (decisao.tipo === 'aprovar') decidirVisita(conta, decisao.id, 'aprovada', justificativa);
      if (decisao.tipo === 'recusar') decidirVisita(conta, decisao.id, 'recusada', justificativa);
      if (decisao.tipo === 'cancelar') cancelarVisita(conta, decisao.id);
      setAviso({
        conferir: 'Vínculo marcado como conferido na demonstração.',
        aprovar: 'Visita aprovada! O solicitante verá o novo status ao abrir sua conta.',
        recusar: 'Visita recusada e justificativa registrada.',
        cancelar: 'Solicitação cancelada com sucesso.',
      }[decisao.tipo]);
      setErro('');
      setDecisao(null);
      setJustificativa('');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível concluir a ação.');
      setDecisao(null);
    }
  }

  function mudarParticipacao(id: string) {
    if (conta.papel !== 'idoso' && !gestor) return;
    const atualizada = participacoes.includes(id) ? participacoes.filter((x) => x !== id) : [...participacoes, id];
    try {
      localStorage.setItem('vida-saude-atividades-v1', JSON.stringify(atualizada));
      setParticipacoes(atualizada);
      setAviso('Participação registrada na demonstração.');
    } catch { setErro('O navegador não permitiu salvar a atividade.'); }
  }

  const itensMenu: { titulo: string; aba: Aba; rota: string; simbolo: string }[] = [
    { titulo: 'Visão geral', aba: 'resumo', rota: '/portal', simbolo: '⌂' },
    { titulo: gestor ? 'Gerenciar visitas' : 'Minhas visitas', aba: 'visitas', rota: '/portal/visitas', simbolo: '▣' },
    ...(solicitante ? [{ titulo: 'Solicitar visita', aba: 'solicitar' as const, rota: '/portal/solicitar', simbolo: '+' }] : []),
    { titulo: 'Atividades', aba: 'atividades', rota: '/portal/atividades', simbolo: '☀' },
  ];

  return (
    <MobileAppShell className="portal-screen">
      <div className="portal-layout">
        <aside className="portal-side" aria-label="Menu do portal">
          <div className="portal-brand"><span aria-hidden="true">♥</span><strong>VidaSaúde</strong></div>
          <p className="portal-caption">Cuidando de você com carinho</p>
          <div className="portal-side-label">ÁREA DO {PAPEIS[conta.papel].toUpperCase()}</div>
          <nav className="portal-side-nav">
            {itensMenu.map((item) => <button key={item.aba} type="button" className={aba === item.aba ? 'active' : ''} onClick={() => navegar(item.rota)}>
              <span aria-hidden="true" className="portal-nav-symbol">{item.simbolo}</span>{item.titulo}
            </button>)}
          </nav>
          <div className="portal-side-bottom"><div className="portal-account"><span className="portal-avatar">{conta.nome[0]?.toUpperCase()}</span><span><strong>{conta.nome}</strong><small>{PAPEIS[conta.papel]}</small></span></div>
            {conta.papel === 'idoso' && <button onClick={() => navigate('/inicio')} type="button">← Voltar à Minha Saúde</button>}
            <button onClick={sair} type="button">Trocar perfil / Sair</button>
          </div>
        </aside>

        <div className="portal-main">
          <header className="portal-hero">
            <div>
              <span className="portal-eyebrow">{PAPEIS[conta.papel]} · Ambiente demonstrativo</span>
              <h1>{aba === 'solicitar' ? 'Solicitar visita' : aba === 'visitas' ? 'Visitas' : aba === 'atividades' ? 'Atividades do dia' : `Olá, ${conta.nome.split(' ')[0]}!`}</h1>
              <p>{aba === 'resumo' ? 'Acompanhe os cuidados e as visitas com segurança.' : aba === 'visitas' ? 'Consulte solicitações e acompanhe cada etapa.' : aba === 'solicitar' ? 'Agende uma visita à pessoa residente.' : 'Momentos de convivência e bem-estar.'}</p>
            </div>
            <button className="portal-avatar portal-avatar-button" type="button" aria-label="Trocar perfil" onClick={sair}>{conta.nome[0]?.toUpperCase()}</button>
          </header>

          <main className="portal-content">
            <div className="portal-privacy-note" role="note"><VidaIcon nome="aviso" tamanho={18} /> Protótipo acadêmico: perfis, comprovantes, permissões e aprovações são simulados neste navegador; não há autenticação nem verificação de identidade real.</div>
            {erro && <div className="portal-message portal-error" role="alert">{erro}<button type="button" onClick={() => setErro('')} aria-label="Fechar erro">×</button></div>}
            {aviso && <div className="portal-message portal-success" role="status">{aviso}{protocolo && <strong> Protocolo: {protocolo}</strong>}<button type="button" onClick={() => setAviso('')} aria-label="Fechar aviso">×</button></div>}

            {aba === 'resumo' && <>
              <div className="portal-stats">
                <article><span>Visitas pendentes</span><strong>{pendentes}</strong><small>{gestor ? 'Aguardando sua análise' : 'Em análise pela equipe'}</small></article>
                <article><span>Visitas aprovadas</span><strong>{aprovadas}</strong><small>Agendamentos confirmados</small></article>
                <article><span>Atividades programadas</span><strong>{ATIVIDADES.length}</strong><small>Rotina demonstrativa</small></article>
              </div>
              <div className="portal-columns">
                <section className="portal-card">
                  <div className="portal-section-title"><h2>{gestor ? 'Painel do cuidador' : conta.papel === 'cuidador' ? 'Cadastro aguardando validação' : conta.papel === 'idoso' ? 'Minhas visitas' : 'Solicitações de visita'}</h2></div>
                  <p>{gestor ? 'Confira a declaração de vínculo, analise e decida sobre os pedidos recebidos.' : conta.papel === 'cuidador' ? 'Este cadastro de cuidador ainda não permite ver ou aprovar solicitações. Para testar a análise, use Ana Lima, a cuidadora demonstrativa.' : conta.papel === 'idoso' ? 'Veja as visitas solicitadas e aprovadas para você.' : 'Solicite um horário e acompanhe sua aprovação pela equipe da instituição.'}</p>
                  <button type="button" className="portal-primary" onClick={() => navegar('/portal/visitas')}>{gestor ? 'Analisar solicitações' : conta.papel === 'cuidador' ? 'Ver status do acesso' : 'Acompanhar visitas'} →</button>
                  {solicitante && <button type="button" className="portal-outline" onClick={() => navegar('/portal/solicitar')}>+ Fazer nova solicitação</button>}
                  {conta.papel === 'idoso' && <button className="portal-outline" type="button" onClick={() => navigate('/inicio')}>Voltar à Minha Saúde</button>}
                </section>
                <section className="portal-card"><div className="portal-section-title"><h2>Atividades recreativas</h2></div>
                  {ATIVIDADES.map((atividade) => <div className="portal-activity-line" key={atividade.id}><strong>{atividade.hora}</strong><span>{atividade.nome}</span></div>)}
                  <button type="button" className="portal-outline" onClick={() => navegar('/portal/atividades')}>Ver programação →</button>
                </section>
              </div>
              {gestor && <section className="portal-card portal-care-health">
                <h2>Acompanhamento de saúde · Maria Oliveira</h2>
                <p>Resumo visual dos dados demonstrativos para supervisão do cuidador. Os registros continuam no perfil do idoso.</p>
                <div className="portal-care-vitals">
                  {(['glicose', 'pressao', 'batimentos'] as TipoMedicao[]).map((tipo) => {
                    const registro = ultimaMedicao(lerMedicoes(), tipo);
                    return <div key={tipo}><small>{CONFIG[tipo].nome}</small><strong>{registro ? formatarValor(registro) : '—'}</strong><span>{CONFIG[tipo].unidade}</span></div>;
                  })}
                  <div><small>Horários concluídos</small><strong>{totalConcluidos(lerAgenda())}/{AGENDA.length}</strong><span>medicamentos</span></div>
                </div>
              </section>}
              {conta.situacao === 'pendente' && conta.papel === 'cuidador' && <section className="portal-card"><h2>Cadastro em análise</h2><p>Este perfil foi criado localmente e está aguardando validação fictícia. Para demonstrar aprovações, utilize a conta pré-configurada de cuidador.</p></section>}
            </>}

            {aba === 'visitas' && <>
              <div className="portal-section-title"><h2>{gestor ? 'Solicitações recebidas' : conta.papel === 'idoso' ? 'Visitas à pessoa residente' : 'Minhas solicitações'}</h2>
                {solicitante && <button type="button" className="portal-primary portal-small" onClick={() => navegar('/portal/solicitar')}>+ Nova visita</button>}
              </div>
              {lista.length === 0 ? <div className="portal-card portal-empty"><h3>Nenhuma visita encontrada</h3><p>Quando houver solicitações, elas aparecerão aqui.</p></div> : (
                <div className="portal-visit-list">{lista.map((visita) => <article className="portal-card portal-visit" key={visita.id}>
                  <div className="portal-visit-head"><strong>{visita.solicitanteNome}</strong><Status visita={visita} /></div>
                  <div className="portal-visit-meta"><span>📅 {dataVisita(visita.data)} · {visita.hora}</span><span>👤 {visita.relacao} de {visita.idosoNome}</span><span>Protocolo: {visita.id}</span></div>
                  <div className="portal-proof"><strong>Comprovação declarada:</strong> {visita.comprovacao}<br />
                    <strong>Conferência:</strong> {visita.conferido === 'conferido' ? 'Conferida na simulação' : 'Pendente'}
                  </div>
                  {visita.observacoes && <p><strong>Observação:</strong> {visita.observacoes}</p>}
                  {visita.observacaoResposta && <p><strong>Resposta:</strong> {visita.observacaoResposta}</p>}
                  <div className="portal-actions">
                    {gestor && visita.status === 'pendente' && <>
                      {visita.conferido === 'pendente' && <button type="button" className="portal-outline" onClick={() => { setDecisao({ id: visita.id, tipo: 'conferir' }); setJustificativa(''); }}>Conferir vínculo</button>}
                      <button type="button" className="portal-primary" disabled={visita.conferido !== 'conferido'} title={visita.conferido !== 'conferido' ? 'Confira o vínculo antes' : undefined} onClick={() => { setDecisao({ id: visita.id, tipo: 'aprovar' }); setJustificativa(''); }}>Aprovar</button>
                      <button type="button" className="portal-danger-outline" onClick={() => { setDecisao({ id: visita.id, tipo: 'recusar' }); setJustificativa(''); }}>Recusar</button>
                    </>}
                    {solicitante && visita.solicitanteId === conta.id && visita.status === 'pendente' && <button type="button" className="portal-danger-outline" onClick={() => setDecisao({ id: visita.id, tipo: 'cancelar' })}>Cancelar solicitação</button>}
                  </div>
                </article>)}</div>
              )}
              {conta.papel === 'cuidador' && !gestor && <div className="portal-privacy-note">Sua conta de cuidador ainda não foi validada. Apenas o cuidador pré-configurado pode analisar solicitações na demonstração.</div>}
            </>}

            {aba === 'solicitar' && (solicitante ? <form className="portal-card portal-request-form" onSubmit={enviarPedido} noValidate>
              <h2>Dados da visita</h2><p>O pedido será enviado para avaliação demonstrativa da equipe responsável.</p>
              <div className="portal-form-grid">
                <label>Pessoa residente<input value={lerPerfil().nome} disabled /></label>
                <label>Solicitante<input value={conta.nome} disabled /></label>
                <label>Parentesco ou amizade<input value={pedido.relacao} required maxLength={60} onChange={(e) => setPedido({ ...pedido, relacao: e.target.value })} placeholder="Ex.: filha, irmão, amiga" /></label>
                <label>Tipo de comprovação (simulação)
                  <select value={pedido.comprovacao} required onChange={(e) => setPedido({ ...pedido, comprovacao: e.target.value })}>
                    <option value="">Selecione uma opção</option>
                    <option>Declaração de parentesco (simulada)</option>
                    <option>Convite informado pelo visitante (simulado)</option>
                    <option>Autorização familiar informada (simulada)</option>
                  </select>
                </label>
                <label>Data pretendida<input type="date" min={dataLocal()} required value={pedido.data} onChange={(e) => setPedido({ ...pedido, data: e.target.value })} /></label>
                <label>Horário (08:00 a 18:00)<input type="time" min="08:00" max="18:00" required value={pedido.hora} onChange={(e) => setPedido({ ...pedido, hora: e.target.value })} /></label>
                <label className="portal-full">Observação (opcional)<textarea rows={3} maxLength={300} value={pedido.observacoes} onChange={(e) => setPedido({ ...pedido, observacoes: e.target.value })} placeholder="Informações para a equipe" /></label>
              </div>
              <label className="portal-check"><input type="checkbox" checked={pedido.declarado} onChange={(e) => setPedido({ ...pedido, declarado: e.target.checked })} />
                <span>Declaro, somente para esta demonstração, que possuo vínculo com a pessoa residente. Entendo que nenhuma identidade ou documento será verificado de verdade.</span></label>
              <div className="portal-actions"><button type="submit" className="portal-primary">Enviar solicitação</button><button className="portal-outline" type="button" onClick={() => navegar('/portal/visitas')}>Cancelar</button></div>
            </form> : <div className="portal-card portal-empty"><h2>Opção indisponível</h2><p>Somente familiar ou visitante pode solicitar visita.</p><button type="button" className="portal-primary" onClick={() => navegar('/portal')}>Voltar ao painel</button></div>)}

            {aba === 'atividades' && <>
              <div className="portal-section-title"><h2>Programação de hoje</h2></div>
              <div className="portal-activity-grid">{ATIVIDADES.map((atividade) => <article className="portal-card" key={atividade.id}>
                <div className="portal-activity-header"><span className="portal-activity-time">{atividade.hora}</span><span className="portal-status portal-status-aprovada">Programada</span></div>
                <h3>{atividade.nome}</h3><p>{atividade.detalhe}</p><small>Local: {atividade.local}</small>
                {(conta.papel === 'idoso' || gestor) && <button type="button" className={participacoes.includes(atividade.id) ? 'portal-outline' : 'portal-primary'} onClick={() => mudarParticipacao(atividade.id)}>{participacoes.includes(atividade.id) ? '✓ Participação registrada · Desfazer' : 'Registrar participação'}</button>}
                {(conta.papel === 'visitante' || conta.papel === 'familiar') && <p className="portal-quiet">Acompanhamento informativo; registro restrito ao idoso e cuidador.</p>}
              </article>)}</div>
            </>}
          </main>
        </div>

        <nav className="portal-bottom" aria-label="Navegação mobile">
          {itensMenu.map((item) => <button key={item.aba} type="button" aria-current={aba === item.aba ? 'page' : undefined} className={aba === item.aba ? 'active' : ''} onClick={() => navegar(item.rota)}><span aria-hidden="true">{item.simbolo}</span><small>{item.aba === 'resumo' ? 'Início' : item.aba === 'solicitar' ? 'Solicitar' : item.aba === 'atividades' ? 'Atividades' : 'Visitas'}</small></button>)}
        </nav>
      </div>

      {decisao && <div className="portal-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setDecisao(null); }}>
        <section className="portal-modal" role="dialog" aria-modal="true" aria-labelledby="portal-modal-title">
          <h2 id="portal-modal-title">{decisao.tipo === 'conferir' ? 'Conferir vínculo?' : decisao.tipo === 'aprovar' ? 'Aprovar visita?' : decisao.tipo === 'recusar' ? 'Recusar visita?' : 'Cancelar solicitação?'}</h2>
          <p>{decisao.tipo === 'conferir' ? 'Apenas simule que a equipe conferiu o vínculo declarado. Não há validação de documento ou identidade.' : 'Confirme a alteração. O status será atualizado para os outros perfis deste navegador.'}</p>
          {(decisao.tipo === 'recusar' || decisao.tipo === 'aprovar') && <label>Observação {decisao.tipo === 'recusar' ? '(obrigatória)' : '(opcional)'}<textarea rows={3} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} maxLength={250} placeholder="Observação para o solicitante" /></label>}
          <div className="portal-actions"><button className={decisao.tipo === 'recusar' || decisao.tipo === 'cancelar' ? 'portal-danger' : 'portal-primary'} type="button" onClick={confirmarAcao}>Confirmar</button><button className="portal-outline" type="button" onClick={() => setDecisao(null)}>Voltar</button></div>
        </section>
      </div>}
    </MobileAppShell>
  );
}
