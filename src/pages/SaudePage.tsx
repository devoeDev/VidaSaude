import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileAppShell from '../components/MobileAppShell';
import VidaIcon, { type NomeIcone } from '../components/VidaIcon';
import {
  CONFIG, TIPOS, dataCompleta, dataCurta, formatarValor,
  guardarMedicao, horaCurta, lerMedicoes, ordenar,
  statusDemonstrativo, ultimaMedicao,
  type Medicao, type TipoMedicao,
} from '../data/medicoes';
import './SaudePage.css';

type Tela = 'resumo' | 'historico' | 'registrar';

const ICONES: Record<TipoMedicao, NomeIcone> = {
  glicose: 'gota', pressao: 'pressao', batimentos: 'batimentos',
};

function tipoDaUrl(busca: string): TipoMedicao {
  const tipo = new URLSearchParams(busca).get('tipo');
  return TIPOS.includes(tipo as TipoMedicao) ? tipo as TipoMedicao : 'glicose';
}

function tituloDaTela(tela: Tela): string {
  if (tela === 'historico') return 'Histórico';
  if (tela === 'registrar') return 'Registrar Medição';
  return 'Minha Saúde';
}

function NavegacaoSaude({ navegar }: {
  navegar: (destino: 'inicio' | 'saude' | 'medicamentos' | 'alertas') => void;
}) {
  const itens: { id: 'inicio' | 'saude' | 'medicamentos' | 'alertas'; rotulo: string; icone: NomeIcone }[] = [
    { id: 'inicio', rotulo: 'Início', icone: 'inicio' },
    { id: 'saude', rotulo: 'Saúde', icone: 'saude' },
    { id: 'medicamentos', rotulo: 'Remédio', icone: 'remedio' },
    { id: 'alertas', rotulo: 'Alertas', icone: 'alertas' },
  ];

  return (
    <>
      <aside className="vs-side" aria-label="Menu lateral">
        <div className="vs-side-brand">
          <span className="vs-side-logo"><VidaIcon nome="saude" preenchido tamanho={24} /></span>
          <span>VidaSaúde</span>
        </div>
        <p>Cuidando de você com carinho</p>
        <span className="vs-side-label">MENU PRINCIPAL</span>
        <nav className="vs-side-links">
          {itens.map((item) => (
            <button type="button" key={item.id}
              className={item.id === 'saude' ? 'vs-selected' : ''}
              onClick={() => navegar(item.id)}>
              <VidaIcon nome={item.icone} tamanho={22} />{item.id === 'medicamentos' ? 'Medicamentos' : item.rotulo}
            </button>
          ))}
        </nav>
      </aside>
      <nav className="vs-bottom" aria-label="Navegação inferior">
        {itens.map((item) => (
          <button type="button" key={item.id}
            aria-current={item.id === 'saude' ? 'page' : undefined}
            className={item.id === 'saude' ? 'vs-selected' : ''}
            onClick={() => navegar(item.id)}>
            <VidaIcon nome={item.icone} tamanho={23} preenchido={item.id === 'saude'} />
            <span>{item.rotulo}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

function Grafico({ tipo, medicoes }: { tipo: TipoMedicao; medicoes: Medicao[] }) {
  const dias = Array.from({ length: 7 }, (_, indice) => {
    const data = new Date();
    data.setDate(data.getDate() - (6 - indice));
    data.setHours(0, 0, 0, 0);
    const identificador = `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;
    const encontrado = ordenar(medicoes.filter((m) => {
      const d = new Date(m.data);
      return m.tipo === tipo && `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === identificador;
    }))[0];
    return { data, valor: encontrado?.valor ?? null };
  });

  const valores = dias.map((d) => d.valor).filter((v): v is number => v !== null);
  const minimo = tipo === 'glicose' ? 0 : tipo === 'pressao' ? 60 : 30;
  const baseMaxima = tipo === 'glicose' ? 120 : tipo === 'pressao' ? 180 : 120;
  const maximo = Math.max(baseMaxima, Math.ceil(Math.max(...valores, 0) / 20) * 20);
  const esquerda = 39;
  const direita = 325;
  const topo = 22;
  const fundo = 178;
  const posX = (i: number) => esquerda + (i * (direita - esquerda)) / 6;
  const posY = (valor: number) => fundo - ((valor - minimo) / (maximo - minimo)) * (fundo - topo);
  const pontos = dias.map((dia, i) => dia.valor === null ? null : `${posX(i)},${posY(dia.valor)}`);
  const segmentos: string[] = [];
  let atual: string[] = [];
  pontos.forEach((ponto) => {
    if (ponto) atual.push(ponto);
    else if (atual.length) { segmentos.push(atual.join(' ')); atual = []; }
  });
  if (atual.length) segmentos.push(atual.join(' '));
  const niveis = Array.from({ length: 5 }, (_, i) => minimo + ((maximo - minimo) * i) / 4);

  return (
    <div className="vs-chart-card">
      <h2>{CONFIG[tipo].nome} <small>em {CONFIG[tipo].unidade}</small></h2>
      <svg className="vs-chart" viewBox="0 0 350 225" role="img"
        aria-label={`Gráfico de ${CONFIG[tipo].nome}, últimos sete dias`}>
        {niveis.map((nivel) => (
          <g key={nivel}>
            <line x1={esquerda} x2={direita} y1={posY(nivel)} y2={posY(nivel)}
              stroke="#e4e5e4" strokeDasharray="4 4" />
            <text x="29" y={posY(nivel) + 5} fill="#777" textAnchor="end" fontSize="13">{Math.round(nivel)}</text>
          </g>
        ))}
        {dias.map((dia, i) => (
          <g key={i}>
            <line x1={posX(i)} x2={posX(i)} y1={topo} y2={fundo}
              stroke="#e9e9e9" strokeDasharray="4 4" />
            <text x={posX(i)} y="202" fill="#707070" textAnchor="middle" fontSize="12">
              {`${dia.data.getDate()}/${dia.data.getMonth() + 1}`}
            </text>
          </g>
        ))}
        <line x1={esquerda} x2={direita} y1={fundo} y2={fundo} stroke="#888" strokeWidth="1.4" />
        <line x1={esquerda} x2={esquerda} y1={topo} y2={fundo} stroke="#888" strokeWidth="1.4" />
        {segmentos.map((segmento, i) => (
          <polyline key={i} points={segmento} fill="none" stroke="#20c3df"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {dias.map((dia, i) => dia.valor === null ? null : (
          <circle key={i} cx={posX(i)} cy={posY(dia.valor)} r="5.5" fill="#20c3df" />
        ))}
      </svg>
      {tipo === 'pressao' && <p className="vs-chart-note">O gráfico apresenta a pressão sistólica. Os dois valores aparecem nos registros.</p>}
      {valores.length === 0 && <p className="vs-chart-note">Nenhuma medição nos últimos sete dias.</p>}
    </div>
  );
}

export default function SaudePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const tela: Tela = location.pathname.endsWith('/historico') ? 'historico'
    : location.pathname.endsWith('/registrar') ? 'registrar' : 'resumo';

  const [tipo, setTipo] = useState<TipoMedicao>(() => tipoDaUrl(location.search));
  const [medicoes, setMedicoes] = useState<Medicao[]>(lerMedicoes);
  const [valor, setValor] = useState('');
  const [diastolica, setDiastolica] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => { setTipo(tipoDaUrl(location.search)); }, [location.search]);
  useEffect(() => {
    function atualizar() { setMedicoes(lerMedicoes()); }
    window.addEventListener('vida-saude-medicoes-atualizadas', atualizar);
    return () => window.removeEventListener('vida-saude-medicoes-atualizadas', atualizar);
  }, []);

  function ir(destino: 'inicio' | 'saude' | 'medicamentos' | 'alertas') {
    if (destino === 'saude') navigate('/saude');
    else if (destino === 'inicio') navigate('/inicio');
    else navigate(destino === 'medicamentos' ? '/medicamentos' : '/horarios');
  }

  function irPara(t: Tela, selecionado: TipoMedicao = tipo) {
    if (t === 'resumo') navigate('/saude');
    else navigate(`/saude/${t}?tipo=${selecionado}`);
  }

  function mudarTipo(novo: TipoMedicao) {
    setTipo(novo);
    setValor('');
    setDiastolica('');
    setErro('');
    navigate(`${location.pathname}?tipo=${novo}`, { replace: true });
  }

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const numero = Number(valor);
    const dia = Number(diastolica);
    if (!valor.trim() || !Number.isInteger(numero) || numero <= 0) {
      setErro('Informe um valor inteiro válido.');
      return;
    }
    if (tipo === 'pressao') {
      if (!diastolica.trim() || !Number.isInteger(dia) || dia <= 0 || dia >= numero) {
        setErro('A pressão diastólica deve ser positiva e menor que a sistólica.');
        return;
      }
    }
    const limites = tipo === 'glicose' ? [20, 600] : tipo === 'pressao' ? [40, 300] : [30, 220];
    if (numero < limites[0] || numero > limites[1] || (tipo === 'pressao' && (dia < 20 || dia > 200))) {
      setErro('Confira o valor informado antes de salvar.');
      return;
    }
    const nova: Medicao = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `med-${Date.now()}`,
      tipo, valor: numero, ...(tipo === 'pressao' ? { diastolica: dia } : {}),
      data: new Date().toISOString(),
    };
    try {
      guardarMedicao(nova);
      navigate(`/saude/historico?tipo=${tipo}&salvo=1`);
    } catch {
      setErro('Não foi possível salvar neste navegador. Verifique se o armazenamento local está permitido.');
    }
  }

  const registros = ordenar(medicoes.filter((m) => m.tipo === tipo)).filter((m) =>
    Date.parse(m.data) >= Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  return (
    <MobileAppShell className="vs-health-screen">
      <div className="vs-health-layout">
        <NavegacaoSaude navegar={ir} />
        <div className="vs-health-main">
          <header className={`vs-health-header ${tela === 'registrar' ? 'vs-header-register' : ''}`}>
            {tela !== 'resumo' && (
              <button type="button" className="vs-back" onClick={() =>
                tela === 'historico' ? irPara('resumo') : irPara('resumo')
              }>
                <VidaIcon nome="voltar" tamanho={20} /> Voltar
              </button>
            )}
            <h1>{tituloDaTela(tela)}</h1>
            <p>{tela === 'historico' ? 'Últimos 7 dias' : dataCompleta()}</p>
          </header>

          <main className={`vs-health-content vs-${tela}`}>
            {tela !== 'resumo' && (
              <div className="vs-tabs" role="group" aria-label="Tipo de medição">
                {TIPOS.map((t) => (
                  <button key={t} type="button" onClick={() => mudarTipo(t)}
                    className={tipo === t ? 'vs-tab-active' : ''}
                    aria-pressed={tipo === t}>{CONFIG[t].curto}</button>
                ))}
              </div>
            )}

            {tela === 'resumo' && (
              <div className="vs-overview-inner">
                <div className="vs-measure-list">
                  {TIPOS.map((t) => {
                    const atual = ultimaMedicao(medicoes, t);
                    const status = atual ? statusDemonstrativo(atual) : null;
                    return (
                      <button key={t} type="button" className="vs-measure-card"
                        onClick={() => irPara('historico', t)}>
                        <span className={`vs-measure-icon vs-color-${t}`}>
                          <VidaIcon nome={ICONES[t]} tamanho={26} preenchido={t !== 'pressao'} />
                        </span>
                        <span className="vs-measure-copy">
                          <span className="vs-measure-name">{CONFIG[t].nome}</span>
                          <span className="vs-measure-reading">
                            <strong>{atual ? formatarValor(atual) : '—'}</strong>
                            <small>{CONFIG[t].unidade}</small>
                          </span>
                          {status && <span className={`vs-status vs-status-${status.toLowerCase()}`}>{status}</span>}
                        </span>
                        <VidaIcon nome="seta" tamanho={22} />
                      </button>
                    );
                  })}
                </div>
                <div className="vs-overview-actions">
                  <button type="button" className="vs-outline-btn" onClick={() => irPara('historico', 'glicose')}>
                    Ver Histórico Completo
                  </button>
                  <button type="button" className="vs-primary-btn" onClick={() => irPara('registrar', 'glicose')}>
                    <VidaIcon nome="mais" tamanho={19} /> Registrar Medição
                  </button>
                </div>
              </div>
            )}

            {tela === 'historico' && (
              <div className="vs-history-inner">
                {new URLSearchParams(location.search).has('salvo') && (
                  <div className="vs-success" role="status"><VidaIcon nome="check" tamanho={20} /> Medição salva com sucesso!</div>
                )}
                <Grafico tipo={tipo} medicoes={medicoes} />
                <section className="vs-records" aria-labelledby="vs-records-title">
                  <h2 id="vs-records-title">Registros</h2>
                  {registros.length === 0 ? (
                    <p>Nenhum registro neste período.</p>
                  ) : (
                    <div className="vs-record-list">
                      {registros.map((registro) => {
                        const status = statusDemonstrativo(registro);
                        return (
                          <div className="vs-record-row" key={registro.id}>
                            <span className="vs-record-date"><strong>{dataCurta(registro.data)}</strong><small>{horaCurta(registro.data)}</small></span>
                            <span className="vs-record-value"><strong>{formatarValor(registro)}</strong><small>{CONFIG[tipo].unidade}</small></span>
                            <span className={`vs-status vs-status-${status.toLowerCase()}`}>{status}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
                <button type="button" className="vs-primary-btn vs-history-add" onClick={() => irPara('registrar', tipo)}>
                  <VidaIcon nome="mais" tamanho={19} /> Registrar Medição
                </button>
              </div>
            )}

            {tela === 'registrar' && (
              <div className="vs-register-inner">
                <form id="vs-register-form" onSubmit={salvar} noValidate>
                  <div className="vs-input-card">
                    <h2>{CONFIG[tipo].nome} <small>em {CONFIG[tipo].unidade}</small></h2>
                    {tipo === 'pressao' ? (
                      <div className="vs-pressure-inputs">
                        <label>Sistólica
                          <input type="number" inputMode="numeric" placeholder="120" value={valor}
                            onChange={(e) => { setValor(e.target.value); setErro(''); }} />
                        </label>
                        <label>Diastólica
                          <input type="number" inputMode="numeric" placeholder="80" value={diastolica}
                            onChange={(e) => { setDiastolica(e.target.value); setErro(''); }} />
                        </label>
                      </div>
                    ) : (
                      <label className="vs-main-input">Valor
                        <input type="number" inputMode="numeric" placeholder="000" value={valor}
                          onChange={(e) => { setValor(e.target.value); setErro(''); }} />
                      </label>
                    )}
                    <div className="vs-recorded-now">
                      <VidaIcon nome="relogio" tamanho={20} />
                      <span><strong>{new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date())}</strong>
                        <small>{dataCompleta()}</small></span>
                    </div>
                    {erro && <p className="vs-field-error" role="alert">{erro}</p>}
                  </div>
                  <div className="vs-form-actions">
                    <button type="submit" className="vs-primary-btn">Salvar Medição</button>
                    <button type="button" className="vs-outline-btn" onClick={() => irPara('resumo')}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <p className="vs-demo-disclaimer">Dados e classificações ilustrativos para a apresentação. Não substituem avaliação profissional de saúde.</p>
          </main>
        </div>
      </div>
    </MobileAppShell>
  );
}
