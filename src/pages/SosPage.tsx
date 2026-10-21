import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../components/MobileAppShell';
import VidaIcon from '../components/VidaIcon';
import { lerPerfil } from '../data/perfil';
import './CarePages.css';

type Motivo = 'medica' | 'queda' | 'mal' | null;
type Contato = 'familia' | 'samu' | null;

export default function SosPage() {
  const navigate = useNavigate();
  const [motivo, setMotivo] = useState<Motivo>(null);
  const [contato, setContato] = useState<Contato>(null);
  const [confirmado, setConfirmado] = useState(false);
  const perfil = lerPerfil();
  const motivos: { id: Exclude<Motivo, null>; texto: string; simbolo: string; classe: string }[] = [
    { id: 'medica', texto: 'Preciso de ajuda médica', simbolo: '✚', classe: 'vermelho' },
    { id: 'queda', texto: 'Sofri uma queda', simbolo: '✚', classe: 'roxo' },
    { id: 'mal', texto: 'Estou passando mal', simbolo: '♥', classe: 'azul' },
  ];

  function abrirConfirmacao(tipo: Contato) { setConfirmado(false); setContato(tipo); }
  return (
    <MobileAppShell className="care-sos-screen">
      <main className="care-sos-layout">
        <header className="care-sos-header"><button type="button" onClick={() => navigate('/inicio')} className="care-sos-top-back"><VidaIcon nome="voltar" tamanho={20} /> Voltar</button>
          <strong>SOS</strong><h1>EMERGÊNCIA</h1><p>O que aconteceu?</p>
        </header>
        <div className="care-sos-body">
          <div className="care-sos-choices">
            {motivos.map((item) => <button key={item.id} type="button" aria-pressed={motivo === item.id}
              className={`care-sos-choice ${motivo === item.id ? 'chosen' : ''}`} onClick={() => setMotivo(item.id)}>
              <span className={`care-sos-reason-icon ${item.classe}`}>{item.simbolo}</span><strong>{item.texto}</strong>
              {motivo === item.id && <VidaIcon nome="check" tamanho={22} />}
            </button>)}
            <button type="button" className="care-sos-choice" onClick={() => navigate('/perfil?editar=contato')}>
              <span className="care-sos-reason-icon verde">☎</span><strong>Adicionar um contato de emergência</strong><VidaIcon nome="seta" tamanho={20} />
            </button>
          </div>
          <p className="care-sos-more">Adicionar Ajuda</p>
          {motivo && <p className="care-sos-selected" role="status">Selecionado: {motivos.find((m) => m.id === motivo)?.texto}</p>}
          <div className="care-sos-ctas">
            <button type="button" className="care-sos-family" onClick={() => abrirConfirmacao('familia')}>Ligar para o contato de emergência</button>
            <button type="button" className="care-sos-192" onClick={() => abrirConfirmacao('samu')}>Ligar para emergência - 192</button>
            <p>Protótipo acadêmico: os botões acima não realizam ligações nem enviam alertas.</p>
          </div>
        </div>
      </main>
      {contato && <div className="care-modal-overlay">
        <section className="care-modal" role="dialog" aria-modal="true" aria-labelledby="sos-modal-titulo">
          <span className="care-sos-modal-mark">!</span>
          <h2 id="sos-modal-titulo">{confirmado ? 'Simulação registrada' : 'Confirmar pedido de ajuda?'}</h2>
          {confirmado ? <p>Este foi apenas um teste do VidaSaúde. Nenhuma chamada foi realizada e nenhuma pessoa foi avisada.</p> : <>
            <p>{contato === 'familia' ? `${perfil.contatoNome} · ${perfil.contatoTelefone}` : 'Serviço de Atendimento Móvel de Urgência · 192'}</p>
            <p>{motivo ? `Motivo selecionado: ${motivos.find((m) => m.id === motivo)?.texto}. ` : ''}Confirme apenas para simular o acionamento.</p>
          </>}
          <div className="care-modal-actions">
            {!confirmado && <button type="button" className="care-btn-outline" onClick={() => setContato(null)}>Cancelar</button>}
            <button type="button" className="care-btn-primary" onClick={() => confirmado ? (setContato(null), navigate('/inicio')) : setConfirmado(true)}>
              {confirmado ? 'Voltar ao início' : 'Confirmar simulação'}
            </button>
          </div>
          <p className="care-sos-real-warning">Se estiver em uma emergência real, ligue diretamente para 192 pelo telefone.</p>
        </section>
      </div>}
    </MobileAppShell>
  );
}
