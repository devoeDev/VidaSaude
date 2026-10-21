
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../components/MobileAppShell';
import { formatarTelefone, telefoneValido } from '../utils/telefone';
import './CadastroPage.css';

type Genero = '' | 'M' | 'F' | 'Outro';

type CamposCadastro = {
  nome: string;
  dia: string;
  mes: string;
  ano: string;
  telefone: string;
  email: string;
  pais: string;
  cidade: string;
  outraCidade: string;
  genero: Genero;
  senha: string;
  confirmarSenha: string;
};

type ErrosCadastro = Partial<
  Record<keyof CamposCadastro | 'nascimento', string>
>;

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const paises = [
  'Brasil', 'Portugal', 'Argentina',
  'Uruguai', 'Paraguai', 'Outro país',
];

const cidades = [
  'Nossa Senhora do Socorro',
  'Aracaju',
  'São Cristóvão',
  'Barra dos Coqueiros',
  'Laranjeiras',
  'Itabaiana',
  'Estância',
  'Outra cidade',
];

const inicial: CamposCadastro = {
  nome: '',
  dia: '',
  mes: '',
  ano: '',
  telefone: '',
  email: '',
  pais: '',
  cidade: '',
  outraCidade: '',
  genero: '',
  senha: '',
  confirmarSenha: '',
};

function dataNascimentoValida(
  dia: string,
  mes: string,
  ano: string
): boolean {
  if (!dia || !mes || !ano) return false;

  const d = Number(dia);
  const m = Number(mes);
  const a = Number(ano);
  const data = new Date(a, m - 1, d);

  return (
    data.getFullYear() === a &&
    data.getMonth() === m - 1 &&
    data.getDate() === d &&
    data <= new Date()
  );
}

export default function CadastroPage() {
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [campos, setCampos] = useState<CamposCadastro>(inicial);
  const [erros, setErros] = useState<ErrosCadastro>({});
  const [concluido, setConcluido] = useState(false);
  const [erroAoSalvar, setErroAoSalvar] = useState(false);

  const anoAtual = new Date().getFullYear();

  const anos = Array.from(
    { length: anoAtual - 1899 },
    (_, indice) => anoAtual - indice
  );

  function alterarCampo<K extends keyof CamposCadastro>(
    campo: K,
    valor: CamposCadastro[K]
  ) {
    setCampos((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setErros((anterior) => ({
      ...anterior,
      [campo]: undefined,
      ...(campo === 'dia' || campo === 'mes' || campo === 'ano'
        ? { nascimento: undefined }
        : {}),
    }));
  }

  function voltar() {
    if (etapa === 2) {
      setErros({});
      setEtapa(1);
    } else {
      navigate('/login');
    }
  }

  function validarEtapa1(): ErrosCadastro {
    const novosErros: ErrosCadastro = {};

    if (campos.nome.trim().split(/\s+/).length < 2) {
      novosErros.nome = 'Informe seu nome e sobrenome.';
    }

    if (
      !dataNascimentoValida(
        campos.dia,
        campos.mes,
        campos.ano
      )
    ) {
      novosErros.nascimento =
        'Selecione uma data de nascimento válida.';
    }

    if (!telefoneValido(campos.telefone)) {
      novosErros.telefone =
        'Informe um telefone válido com DDD.';
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        campos.email.trim()
      )
    ) {
      novosErros.email =
        'Informe um endereço de e-mail válido.';
    }

    if (!campos.pais) {
      novosErros.pais = 'Selecione um país.';
    }

    return novosErros;
  }

  function validarEtapa2(): ErrosCadastro {
    const novosErros: ErrosCadastro = {};

    if (!campos.cidade) {
      novosErros.cidade = 'Selecione uma cidade.';
    }

    if (
      campos.cidade === 'Outra cidade' &&
      !campos.outraCidade.trim()
    ) {
      novosErros.outraCidade = 'Digite o nome da cidade.';
    }

    if (!campos.genero) {
      novosErros.genero = 'Selecione uma opção.';
    }

    if (campos.senha.length < 6) {
      novosErros.senha =
        'A senha deve ter pelo menos 6 caracteres.';
    }

    if (
      !campos.confirmarSenha ||
      campos.confirmarSenha !== campos.senha
    ) {
      novosErros.confirmarSenha =
        'As senhas precisam ser iguais.';
    }

    return novosErros;
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const novosErros =
      etapa === 1 ? validarEtapa1() : validarEtapa2();

    setErros(novosErros);

    if (Object.keys(novosErros).length) return;

    if (etapa === 1) {
      setEtapa(2);
      return;
    }

    // Demonstração: salva somente dados do perfil.
    // Não armazena a senha no navegador.
    const perfilDemo = {
      nome: campos.nome.trim(),
      dataNascimento:
        `${campos.ano}-${campos.mes.padStart(2, '0')}-${campos.dia.padStart(2, '0')}`,
      telefone: campos.telefone,
      email: campos.email.trim(),
      pais: campos.pais,
      cidade:
        campos.cidade === 'Outra cidade'
          ? campos.outraCidade.trim()
          : campos.cidade,
      genero: campos.genero,
      cadastradoEm: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        'vida-saude-perfil-demo',
        JSON.stringify(perfilDemo)
      );
      setErroAoSalvar(false);
    } catch {
      setErroAoSalvar(true);
    }

    setConcluido(true);
  }

  return (
    <MobileAppShell className="register-screen">
      <main
        className="register-layout"
        aria-label="Cadastro VidaSaúde"
      >
        <header className="register-hero">
          <button
            className="register-back"
            type="button"
            onClick={voltar}
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5m7 7-7-7 7-7" />
            </svg>
            Voltar
          </button>

          <div className="register-hero-copy">
            <h1>Vamos realizar o seu cadastro</h1>
            <p>
              Precisamos de apenas algumas
              <br />
              informações
            </p>
          </div>
        </header>

        <section
          className="register-panel"
          aria-label={`Etapa ${etapa} de 2`}
        >
          <form
            className="register-form"
            noValidate
            onSubmit={enviar}
          >
            <div className="register-fields">
              {etapa === 1 ? (
                <>
                  {/* NOME COMPLETO */}
                  <div className="register-field">
                    <label htmlFor="cadastro-nome">
                      Nome Completo
                    </label>
                    <input
                      id="cadastro-nome"
                      type="text"
                      autoComplete="name"
                      value={campos.nome}
                      onChange={(evento) =>
                        alterarCampo('nome', evento.target.value)
                      }
                      placeholder="Ex: Maria Oliveira"
                      maxLength={120}
                      className={
                        erros.nome ? 'register-invalid' : ''
                      }
                      aria-invalid={Boolean(erros.nome)}
                    />
                    {erros.nome && (
                      <p className="register-error" role="alert">
                        {erros.nome}
                      </p>
                    )}
                  </div>

                  {/* DATA DE NASCIMENTO */}
                  <div className="register-field">
                    <span
                      className="register-label"
                      id="cadastro-nascimento-label"
                    >
                      Idade
                    </span>

                    <div
                      className="register-date-grid"
                      role="group"
                      aria-labelledby="cadastro-nascimento-label"
                    >
                      <select
                        aria-label="Dia de nascimento"
                        value={campos.dia}
                        onChange={(evento) =>
                          alterarCampo('dia', evento.target.value)
                        }
                      >
                        <option value="">Dia</option>
                        {Array.from(
                          { length: 31 },
                          (_, i) => i + 1
                        ).map((dia) => (
                          <option key={dia} value={dia}>
                            {dia}
                          </option>
                        ))}
                      </select>

                      <select
                        aria-label="Mês de nascimento"
                        value={campos.mes}
                        onChange={(evento) =>
                          alterarCampo('mes', evento.target.value)
                        }
                      >
                        <option value="">Mês</option>
                        {meses.map((mes, indice) => (
                          <option
                            key={mes}
                            value={indice + 1}
                          >
                            {mes}
                          </option>
                        ))}
                      </select>

                      <select
                        aria-label="Ano de nascimento"
                        value={campos.ano}
                        onChange={(evento) =>
                          alterarCampo('ano', evento.target.value)
                        }
                      >
                        <option value="">Ano</option>
                        {anos.map((ano) => (
                          <option key={ano} value={ano}>
                            {ano}
                          </option>
                        ))}
                      </select>
                    </div>

                    {erros.nascimento && (
                      <p className="register-error" role="alert">
                        {erros.nascimento}
                      </p>
                    )}
                  </div>

                  {/* TELEFONE */}
                  <div className="register-field">
                    <label htmlFor="cadastro-telefone">
                      Telefone
                    </label>
                    <input
                      id="cadastro-telefone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={campos.telefone}
                      onChange={(evento) =>
                        alterarCampo(
                          'telefone',
                          formatarTelefone(evento.target.value)
                        )
                      }
                      placeholder="(11) 99999-9999"
                      className={
                        erros.telefone ? 'register-invalid' : ''
                      }
                      aria-invalid={Boolean(erros.telefone)}
                    />

                    {erros.telefone && (
                      <p className="register-error" role="alert">
                        {erros.telefone}
                      </p>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div className="register-field">
                    <label htmlFor="cadastro-email">
                      Email
                    </label>
                    <input
                      id="cadastro-email"
                      type="email"
                      autoComplete="email"
                      value={campos.email}
                      onChange={(evento) =>
                        alterarCampo('email', evento.target.value)
                      }
                      placeholder="exemplo@gmail.com"
                      className={
                        erros.email ? 'register-invalid' : ''
                      }
                      aria-invalid={Boolean(erros.email)}
                    />

                    {erros.email && (
                      <p className="register-error" role="alert">
                        {erros.email}
                      </p>
                    )}
                  </div>

                  {/* PAÍS */}
                  <div className="register-field">
                    <label htmlFor="cadastro-pais">
                      País
                    </label>
                    <select
                      id="cadastro-pais"
                      value={campos.pais}
                      onChange={(evento) =>
                        alterarCampo('pais', evento.target.value)
                      }
                      className={
                        erros.pais ? 'register-invalid' : ''
                      }
                      aria-invalid={Boolean(erros.pais)}
                    >
                      <option value="">
                        Selecione seu país
                      </option>
                      {paises.map((pais) => (
                        <option key={pais} value={pais}>
                          {pais}
                        </option>
                      ))}
                    </select>

                    {erros.pais && (
                      <p className="register-error" role="alert">
                        {erros.pais}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* CIDADE */}
                  <div className="register-field">
                    <label htmlFor="cadastro-cidade">
                      Cidade
                    </label>
                    <select
                      id="cadastro-cidade"
                      value={campos.cidade}
                      onChange={(evento) =>
                        alterarCampo('cidade', evento.target.value)
                      }
                      className={
                        erros.cidade ? 'register-invalid' : ''
                      }
                      aria-invalid={Boolean(erros.cidade)}
                    >
                      <option value="">
                        Selecione sua cidade
                      </option>
                      {cidades.map((cidade) => (
                        <option key={cidade} value={cidade}>
                          {cidade}
                        </option>
                      ))}
                    </select>

                    {erros.cidade && (
                      <p className="register-error" role="alert">
                        {erros.cidade}
                      </p>
                    )}

                    {campos.cidade === 'Outra cidade' && (
                      <div className="register-other-city">
                        <label htmlFor="cadastro-outra-cidade">
                          Qual cidade?
                        </label>
                        <input
                          id="cadastro-outra-cidade"
                          type="text"
                          value={campos.outraCidade}
                          onChange={(evento) =>
                            alterarCampo(
                              'outraCidade',
                              evento.target.value
                            )
                          }
                          placeholder="Digite sua cidade"
                          className={
                            erros.outraCidade
                              ? 'register-invalid'
                              : ''
                          }
                        />
                        {erros.outraCidade && (
                          <p
                            className="register-error"
                            role="alert"
                          >
                            {erros.outraCidade}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* GÊNERO */}
                  <fieldset className="register-field register-gender-field">
                    <legend>Gênero</legend>

                    <div className="register-gender-options">
                      {(['M', 'F', 'Outro'] as const).map(
                        (genero) => (
                          <label
                            key={genero}
                            className={`register-gender-option ${
                              campos.genero === genero
                                ? 'register-gender-selected'
                                : ''
                            }`}
                          >
                            <span>{genero}</span>
                            <input
                              type="radio"
                              name="genero"
                              value={genero}
                              checked={campos.genero === genero}
                              onChange={() =>
                                alterarCampo('genero', genero)
                              }
                            />
                            <span
                              className="register-radio-circle"
                              aria-hidden="true"
                            />
                          </label>
                        )
                      )}
                    </div>

                    {erros.genero && (
                      <p className="register-error" role="alert">
                        {erros.genero}
                      </p>
                    )}
                  </fieldset>

                  {/* SENHA */}
                  <div className="register-field register-password-first">
                    <label htmlFor="cadastro-senha">
                      Senha
                    </label>
                    <input
                      id="cadastro-senha"
                      type="password"
                      autoComplete="new-password"
                      value={campos.senha}
                      onChange={(evento) =>
                        alterarCampo('senha', evento.target.value)
                      }
                      placeholder="***********"
                      className={
                        erros.senha ? 'register-invalid' : ''
                      }
                      aria-invalid={Boolean(erros.senha)}
                    />

                    {erros.senha && (
                      <p className="register-error" role="alert">
                        {erros.senha}
                      </p>
                    )}
                  </div>

                  {/* CONFIRMAR SENHA */}
                  <div className="register-field">
                    <label htmlFor="cadastro-confirmar-senha">
                      Repita a senha
                    </label>
                    <input
                      id="cadastro-confirmar-senha"
                      type="password"
                      autoComplete="new-password"
                      value={campos.confirmarSenha}
                      onChange={(evento) =>
                        alterarCampo(
                          'confirmarSenha',
                          evento.target.value
                        )
                      }
                      placeholder="***********"
                      className={
                        erros.confirmarSenha
                          ? 'register-invalid'
                          : ''
                      }
                      aria-invalid={Boolean(erros.confirmarSenha)}
                    />

                    {erros.confirmarSenha && (
                      <p className="register-error" role="alert">
                        {erros.confirmarSenha}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* BOTÃO E INDICADOR DAS ETAPAS */}
            <div className="register-footer">
              <button
                className="register-submit"
                type="submit"
              >
                {etapa === 1 ? 'Continuar' : 'Finalizar'}
              </button>

              <div
                className="register-step-dots"
                aria-label={`Etapa ${etapa} de 2`}
              >
                <span
                  className={`register-dot ${
                    etapa === 1 ? 'register-dot-active' : ''
                  }`}
                />
                <span
                  className={`register-dot ${
                    etapa === 2 ? 'register-dot-active' : ''
                  }`}
                />
              </div>
            </div>
          </form>
        </section>
      </main>

      {/* CONFIRMAÇÃO DO CADASTRO */}
      {concluido && (
        <div className="modal-backdrop">
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cadastro-concluido-titulo"
          >
            <div
              className="register-success-icon"
              aria-hidden="true"
            >
              ✓
            </div>

            <h2
              id="cadastro-concluido-titulo"
              className="register-success-title"
            >
              Cadastro concluído!
            </h2>

            <p className="register-success-description">
              {campos.nome.trim().split(' ')[0]}, seu cadastro
              demonstrativo foi realizado com sucesso.
              {erroAoSalvar
                ? ' O navegador não permitiu salvar os dados localmente.'
                : ' Seus dados de perfil foram salvos neste navegador.'}
              {' '}Nenhuma senha foi armazenada.
            </p>

            <button
              type="button"
              className="modal-primary mt-6"
              onClick={() =>
                navigate('/login', { replace: true })
              }
            >
              Ir para o login
            </button>
          </section>
        </div>
      )}
    </MobileAppShell>
  );
}
