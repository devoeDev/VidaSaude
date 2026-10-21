import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CareShell from '../components/CareShell';
import VidaIcon from '../components/VidaIcon';
import { AGENDA, lerAgenda, listaMedicamentos, proximoLembrete, salvarAgenda, totalConcluidos } from '../data/medicamentos';

export default function MedicamentosPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const horarios = pathname === '/horarios';
  const [status, setStatus] = useState(lerAgenda);
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const concluidos = totalConcluidos(status);
  const lembrete = proximoLembrete(status);

  useEffect(() => {
    const atualizar = () => setStatus(lerAgenda());
    window.addEventListener('vida-saude-agenda-atualizada', atualizar);
    return () => window.removeEventListener('vida-saude-agenda-atualizada', atualizar);
  }, []);

  function confirmarHorario(id: string) {
    const seguinte = { ...status, [id]: !status[id] };
    setStatus(seguinte);
    const persistiu = salvarAgenda(seguinte);
    setAviso(persistiu
      ? (seguinte[id] ? 'Horário marcado como tomado.' : 'Registro desfeito com sucesso.')
      : 'Alteração feita nesta tela. O navegador impediu o armazenamento.');
    setConfirmar(null);
  }

  const titulo = horarios ? 'Horários' : 'Medicamentos';
  return (
    <CareShell active={horarios ? 'horarios' : 'medicamentos'} className="care-meds-screen"
      headerClass={horarios ? "care-schedule-hero" : ""} header={<><h1>{titulo}</h1><p>{horarios ? 'Agenda de hoje' : 'Sua lista do dia'}</p></>}>
      <div className="care-meds-inner">
        {aviso && <div className="care-inline-message" role="status"><VidaIcon nome="check" tamanho={19} />{aviso}<button type="button" onClick={() => setAviso('')} aria-label="Fechar mensagem">×</button></div>}
        {horarios ? (
          <>
            <section className="care-progress care-card">
              <div className="care-progress-top"><strong>Progresso do dia</strong><strong>{concluidos}/{AGENDA.length}</strong></div>
              <div className="care-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={AGENDA.length} aria-valuenow={concluidos} aria-label="Horários concluídos">
                <div style={{ width: `${100 * concluidos / AGENDA.length}%` }} />
              </div>
              <p>{AGENDA.length - concluidos === 0 ? 'Todos os horários concluídos!' : `${AGENDA.length - concluidos} ${AGENDA.length - concluidos === 1 ? 'horário pendente' : 'horários pendentes'}`}</p>
            </section>
            <section className="care-timeline-card care-card">
              <h2>Lembretes de hoje</h2>
              <div className="care-timeline">
                {AGENDA.map((item, indice) => (
                  <div className={`care-time-row ${status[item.id] ? 'done' : 'pending'}`} key={item.id}>
                    <span className="care-time-step" aria-hidden="true">{status[item.id] ? '✓' : '●'}</span>
                    {indice !== AGENDA.length - 1 && <span className="care-time-line" aria-hidden="true" />}
                    <div className="care-time-body"><strong>{item.hora}</strong><span>{item.itens.map((m) => `${m.nome} ${m.dose}`).join(' · ')}</span></div>
                    <button type="button" className={status[item.id] ? 'care-time-taken' : 'care-time-action'} onClick={() => setConfirmar(item.id)}>
                      {status[item.id] ? '✓ Tomei' : 'Tomar'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <button type="button" className="care-reminder-banner" onClick={() => navigate('/horarios')}>
              <span className="care-warning-icon"><VidaIcon nome="aviso" tamanho={30} /></span>
              <span><strong>Horários &amp; Lembretes</strong><small>Ver agenda de hoje</small></span>
              <VidaIcon nome="seta" tamanho={24} />
            </button>
            <div className="care-med-list">
              {listaMedicamentos().map((med) => (
                <section key={med.nome} className="care-med-card care-card">
                  <div className="care-med-heading">
                    <span className={`care-med-icon ${med.dados.cor}`}><VidaIcon nome="remedio" tamanho={22} preenchido /></span>
                    <div><h2>{med.nome}</h2><p>{med.dados.dose}</p></div>
                  </div>
                  {med.slots.map((slot) => (
                    <div className="care-med-dose" key={slot.id}>
                      <span className="care-dose-time"><VidaIcon nome="relogio" tamanho={19} /> {slot.hora}</span>
                      <button type="button" onClick={() => setConfirmar(slot.id)} className={status[slot.id] ? 'care-dose-taken' : 'care-dose-pending'}>
                        {status[slot.id] ? '✓ Tomei' : 'Tomar'}
                      </button>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </>
        )}
        <p className="care-med-disclaimer">Medicamentos, doses e horários são dados fictícios para apresentação acadêmica. Não constituem prescrição médica.</p>
      </div>
      {confirmar !== null && (
        <div className="care-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmar(null); }}>
          <section className="care-modal" role="dialog" aria-modal="true" aria-labelledby="care-confirm-title">
            <h2 id="care-confirm-title">{status[confirmar] ? 'Desfazer confirmação?' : 'Confirmar medicamento?'}</h2>
            <p>{AGENDA.find((m) => m.id === confirmar)?.itens.map((m) => `${m.nome} ${m.dose}`).join(' e ')} — {AGENDA.find((m) => m.id === confirmar)?.hora}</p>
            <p>{status[confirmar] ? 'Deseja marcar este horário como pendente novamente?' : 'Você confirma que tomou o(s) medicamento(s) deste horário?'}</p>
            <div className="care-modal-actions">
              <button type="button" className="care-btn-outline" onClick={() => setConfirmar(null)}>Cancelar</button>
              <button type="button" className="care-btn-primary" onClick={() => confirmarHorario(confirmar)}>{status[confirmar] ? 'Desfazer' : 'Confirmar'}</button>
            </div>
          </section>
        </div>
      )}
    </CareShell>
  );
}
