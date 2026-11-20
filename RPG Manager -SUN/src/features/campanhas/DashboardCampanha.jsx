import React, {
  useState
} from "react";

import "./DashboardCampanha.css";

import ClassificacaoEntidade
  from "../entidades/ClassificacaoEntidade.jsx";

import {
  PAPEIS_CAMPANHA,
  TIPOS_ENTIDADE,
  VISIBILIDADES_ENTIDADE,

  possuiPermissao,
  podeVisualizarEntidade,
  podeEditarEntidade,
  podeExcluirEntidade,
  entidadeEstaArquivada
} from "./campanhas.js";


const CHAVES_PERMISSOES_COLABORADOR = [
  "criarNPCs",
  "criarAdversarios",
  "criarMonstros",
  "criarAuxiliares"
];


const ORDEM_TIPOS_ARQUIVO = [
  TIPOS_ENTIDADE.PERSONAGEM,
  TIPOS_ENTIDADE.NPC,
  TIPOS_ENTIDADE.ADVERSARIO,
  TIPOS_ENTIDADE.MONSTRO,
  TIPOS_ENTIDADE.AUXILIAR
];


function DashboardCampanha({
  campanha,

  entidades = [],

  ultimaEntidade = null,

  participantes = [],

  usuarioAtualId = null,

  onAbrirConfiguracoes,

  quantidadeAnotacoes = 0,

  estadoArquivo = {
    aberto: false,
    busca: "",
    filtro: "todos"
  },

  onEstadoArquivoChange,

  onContinuar,

  onAbrirEntidade,

  onNovaFicha,

  onArquivarEntidade,

  onRestaurarEntidade,

  onExcluirEntidade,

  onAlterarVisibilidadeEntidade,

  onAlterarTipoEntidade,

  onAbrirArea
}) {
  const [
    entidadeParaArquivar,
    setEntidadeParaArquivar
  ] = useState(null);


  const [
    motivoArquivamento,
    setMotivoArquivamento
  ] = useState("");


  const arquivoAberto =
    Boolean(
      estadoArquivo?.aberto
    );


  const buscaArquivo =
    typeof estadoArquivo?.busca ===
    "string"
      ? estadoArquivo.busca
      : "";


  const filtroArquivo =
    typeof estadoArquivo?.filtro ===
    "string"
      ? estadoArquivo.filtro
      : "todos";


  function atualizarEstadoArquivo(
    alteracoes
  ) {
    onEstadoArquivoChange?.(
      anterior => ({
        aberto: false,
        busca: "",
        filtro: "todos",

        ...(anterior || {}),

        ...alteracoes
      })
    );
  }


  if (!campanha) {
    return (
      <main className="dashboard-campanha">

        <section className="dashboard-vazio">

          <h2>
            Nenhuma campanha selecionada
          </h2>

        </section>

      </main>
    );
  }


  const papel =
    campanha
      ?.acesso
      ?.papel ||
    PAPEIS_CAMPANHA.JOGADOR;


  const eMestre =
    papel ===
    PAPEIS_CAMPANHA.MESTRE;


  const nomePapel =
    eMestre
      ? "Mestre"
      : "Jogador";


  const participanteAtual =
    participantes.find(
      participante =>
        participante.id ===
        usuarioAtualId
    ) ||
    null;


  function obterParticipante(
    participanteId
  ) {
    return (
      participantes.find(
        participante =>
          participante.id ===
          participanteId
      ) ||
      null
    );
  }


  function obterNomeProprietario(
    entidade
  ) {
    return (
      obterParticipante(
        entidade
          ?.proprietarioId
      )?.nome ||
      "Não identificado"
    );
  }


  function obterTipoEntidade(
    entidade
  ) {
    return (
      entidade?.tipoEntidade ||
      TIPOS_ENTIDADE.PERSONAGEM
    );
  }


  function obterNomeTipo(
    tipo
  ) {
    const nomes = {
      [TIPOS_ENTIDADE.PERSONAGEM]:
        "Personagem",

      [TIPOS_ENTIDADE.NPC]:
        "NPC",

      [TIPOS_ENTIDADE.ADVERSARIO]:
        "Adversário",

      [TIPOS_ENTIDADE.MONSTRO]:
        "Monstro",

      [TIPOS_ENTIDADE.AUXILIAR]:
        "Auxiliar"
    };


    return (
      nomes[tipo] ||
      "Entidade"
    );
  }


  function obterNomeTipoPlural(
    tipo
  ) {
    const nomes = {
      [TIPOS_ENTIDADE.PERSONAGEM]:
        "Personagens",

      [TIPOS_ENTIDADE.NPC]:
        "NPCs",

      [TIPOS_ENTIDADE.ADVERSARIO]:
        "Adversários",

      [TIPOS_ENTIDADE.MONSTRO]:
        "Monstros",

      [TIPOS_ENTIDADE.AUXILIAR]:
        "Auxiliares"
    };


    return (
      nomes[tipo] ||
      "Entidades"
    );
  }


  function obterIconeTipo(
    tipo
  ) {
    const icones = {
      [TIPOS_ENTIDADE.PERSONAGEM]:
        "👤",

      [TIPOS_ENTIDADE.NPC]:
        "🎭",

      [TIPOS_ENTIDADE.ADVERSARIO]:
        "⚔️",

      [TIPOS_ENTIDADE.MONSTRO]:
        "👹",

      [TIPOS_ENTIDADE.AUXILIAR]:
        "🧰"
    };


    return (
      icones[tipo] ||
      "📄"
    );
  }


  function obterVisibilidade(
    entidade
  ) {
    return (
      entidade?.visibilidade ||
      VISIBILIDADES_ENTIDADE.CAMPANHA
    );
  }


  function obterNomeVisibilidade(
    entidade
  ) {
    const visibilidade =
      obterVisibilidade(
        entidade
      );


    if (
      visibilidade ===
      VISIBILIDADES_ENTIDADE.CAMPANHA
    ) {
      return "Campanha";
    }


    if (
      visibilidade ===
      VISIBILIDADES_ENTIDADE.PROPRIETARIO
    ) {
      return "Privada";
    }


    if (
      visibilidade ===
      VISIBILIDADES_ENTIDADE.MESTRE
    ) {
      return "Mestre";
    }


    return "Restrita";
  }


  function obterIconeVisibilidade(
    entidade
  ) {
    const visibilidade =
      obterVisibilidade(
        entidade
      );


    if (
      visibilidade ===
      VISIBILIDADES_ENTIDADE.CAMPANHA
    ) {
      return "🌐";
    }


    if (
      visibilidade ===
      VISIBILIDADES_ENTIDADE.RESTRITA
    ) {
      return "👥";
    }


    return "🔒";
  }


  const podeCriarPersonagem =
    possuiPermissao(
      campanha,
      "criarPersonagens"
    );


  const podeCriarNPC =
    possuiPermissao(
      campanha,
      "criarNPCs"
    );


  const podeCriarAdversario =
    possuiPermissao(
      campanha,
      "criarAdversarios"
    );


  const podeCriarMonstro =
    possuiPermissao(
      campanha,
      "criarMonstros"
    );


  const podeCriarAuxiliar =
    possuiPermissao(
      campanha,
      "criarAuxiliares"
    );


  const podeAdministrarCampanha =
    possuiPermissao(
      campanha,
      "administrarCampanha"
    );


  const possuiAreaMestragem =
    podeCriarNPC ||
    podeCriarAdversario ||
    podeCriarMonstro ||
    podeCriarAuxiliar;


  const eColaborador =
    !eMestre &&
    CHAVES_PERMISSOES_COLABORADOR.some(
      permissao =>
        Boolean(
          campanha
            ?.acesso
            ?.permissoes
            ?.[permissao]
        )
    );


  const listaEntidades =
    Array.isArray(
      entidades
    )
      ? entidades
      : [];


  const entidadesAtivasCampanha =
    listaEntidades.filter(
      entidade =>
        !entidadeEstaArquivada(
          entidade
        )
    );


  const personagensAtivosMestre =
    entidadesAtivasCampanha.filter(
      entidade =>
        obterTipoEntidade(
          entidade
        ) ===
        TIPOS_ENTIDADE.PERSONAGEM
    );


  const personagensPropriosAtivos =
    entidadesAtivasCampanha.filter(
      entidade =>
        obterTipoEntidade(
          entidade
        ) ===
          TIPOS_ENTIDADE.PERSONAGEM &&
        entidade.proprietarioId ===
          usuarioAtualId
    );


  const personagensCompartilhadosAtivos =
    entidadesAtivasCampanha.filter(
      entidade => {
        if (
          obterTipoEntidade(
            entidade
          ) !==
          TIPOS_ENTIDADE.PERSONAGEM
        ) {
          return false;
        }


        if (
          entidade.proprietarioId ===
          usuarioAtualId
        ) {
          return false;
        }


        return podeVisualizarEntidade(
          campanha,
          entidade
        );
      }
    );


  const personagensAtivos =
    eMestre
      ? personagensAtivosMestre
      : personagensPropriosAtivos;


  const entidadesArquivadas =
    listaEntidades
      .filter(
        entidade => {
          if (
            !entidadeEstaArquivada(
              entidade
            )
          ) {
            return false;
          }


          if (eMestre) {
            return true;
          }


          return (
            entidade.proprietarioId ===
            usuarioAtualId
          );
        }
      )
      .sort(
        (a, b) =>
          String(
            a.nome ||
            ""
          )
            .localeCompare(
              String(
                b.nome ||
                ""
              ),
              "pt-BR",
              {
                sensitivity:
                  "base"
              }
            )
      );


  const quantidadeArquivados =
    entidadesArquivadas.length;


  const tiposArquivados =
    ORDEM_TIPOS_ARQUIVO.filter(
      tipo =>
        entidadesArquivadas.some(
          entidade =>
            obterTipoEntidade(
              entidade
            ) ===
            tipo
        )
    );


  const termoBusca =
    buscaArquivo
      .trim()
      .toLocaleLowerCase(
        "pt-BR"
      );


  const entidadesArquivadasFiltradas =
    entidadesArquivadas.filter(
      entidade => {
        const tipo =
          obterTipoEntidade(
            entidade
          );


        if (
          filtroArquivo !==
            "todos" &&
          tipo !==
            filtroArquivo
        ) {
          return false;
        }


        if (!termoBusca) {
          return true;
        }


        return [
          entidade.nome,

          obterNomeTipo(
            tipo
          ),

          entidade
            ?.ciclo
            ?.motivoEncerramento,

          obterNomeProprietario(
            entidade
          )
        ]
          .join(" ")
          .toLocaleLowerCase(
            "pt-BR"
          )
          .includes(
            termoBusca
          );
      }
    );


  const gruposArquivo =
    ORDEM_TIPOS_ARQUIVO
      .map(
        tipo => ({
          tipo,

          entidades:
            entidadesArquivadasFiltradas.filter(
              entidade =>
                obterTipoEntidade(
                  entidade
                ) ===
                tipo
            )
        })
      )
      .filter(
        grupo =>
          grupo.entidades.length >
          0
      );


  function contarTipo(
    tipo
  ) {
    return entidadesAtivasCampanha.filter(
      entidade =>
        obterTipoEntidade(
          entidade
        ) ===
        tipo
    ).length;
  }


  const quantidadeNPCs =
    contarTipo(
      TIPOS_ENTIDADE.NPC
    );


  const quantidadeAdversarios =
    contarTipo(
      TIPOS_ENTIDADE.ADVERSARIO
    );


  const quantidadeMonstros =
    contarTipo(
      TIPOS_ENTIDADE.MONSTRO
    );


  const quantidadeAuxiliares =
    contarTipo(
      TIPOS_ENTIDADE.AUXILIAR
    );


  const podeContinuar =
    ultimaEntidade &&
    !entidadeEstaArquivada(
      ultimaEntidade
    ) &&
    podeVisualizarEntidade(
      campanha,
      ultimaEntidade
    ) &&
    typeof onContinuar ===
      "function";


  function formatarData(
    timestamp
  ) {
    if (!timestamp) {
      return "";
    }


    try {
      return new Date(
        timestamp
      ).toLocaleDateString(
        "pt-BR"
      );

    } catch {
      return "";
    }
  }


  function obterLetraInicial(
    entidade
  ) {
    const nome =
      String(
        entidade?.nome ||
        ""
      ).trim();


    if (!nome) {
      return "#";
    }


    return nome
      .charAt(0)
      .toLocaleUpperCase(
        "pt-BR"
      );
  }


  function abrirModalArquivamento(
    entidade
  ) {
    setEntidadeParaArquivar(
      entidade
    );


    setMotivoArquivamento(
      ""
    );
  }


  function fecharModalArquivamento() {
    setEntidadeParaArquivar(
      null
    );


    setMotivoArquivamento(
      ""
    );
  }


  function confirmarArquivamento() {
    if (
      !entidadeParaArquivar
    ) {
      return;
    }


    onArquivarEntidade?.(
      entidadeParaArquivar,
      motivoArquivamento
    );


    fecharModalArquivamento();
  }


  function abrirArquivo() {
    atualizarEstadoArquivo({
      aberto: true
    });
  }


  function fecharArquivo() {
    atualizarEstadoArquivo({
      aberto: false
    });
  }


  function ControleVisibilidade({
    entidade
  }) {
    if (
      typeof onAlterarVisibilidadeEntidade !==
        "function" ||
      !podeEditarEntidade(
        campanha,
        entidade
      )
    ) {
      return null;
    }


    return (
      <label className="dashboard-controle-menu">

        <span>
          VISIBILIDADE
        </span>


        <select
          value={
            obterVisibilidade(
              entidade
            )
          }
          onChange={
            evento =>
              onAlterarVisibilidadeEntidade(
                entidade,
                evento.target.value
              )
          }
        >

          <option
            value={
              VISIBILIDADES_ENTIDADE.CAMPANHA
            }
          >
            🌐 Toda a campanha
          </option>


          <option
            value={
              VISIBILIDADES_ENTIDADE.MESTRE
            }
          >
            👑 Mestre + proprietário
          </option>


          <option
            value={
              VISIBILIDADES_ENTIDADE.PROPRIETARIO
            }
          >
            🔒 Privada
          </option>

        </select>

      </label>
    );
  }


  function MenuAcoesEntidade({
    entidade
  }) {
    const podeAdministrar =
      podeEditarEntidade(
        campanha,
        entidade
      );


    const podeExcluir =
      podeExcluirEntidade(
        campanha,
        entidade
      );


    if (
      !podeAdministrar &&
      !podeExcluir
    ) {
      return null;
    }


    return (
      <details className="dashboard-acoes">

        <summary>
          ⋯ AÇÕES
        </summary>


        <div className="dashboard-acoes-menu">

          {eMestre &&
            typeof onAlterarTipoEntidade ===
              "function" && (

              <ClassificacaoEntidade
                entidade={
                  entidade
                }
                podeAlterar
                modo="acao"
                onAlterar={
                  onAlterarTipoEntidade
                }
              />

            )}


          <ControleVisibilidade
            entidade={
              entidade
            }
          />


          {podeAdministrar && (

            <button
              type="button"
              className="dashboard-botao-secundario"
              onClick={() =>
                abrirModalArquivamento(
                  entidade
                )
              }
            >
              📦 ARQUIVAR
            </button>

          )}


          {podeExcluir && (

            <button
              type="button"
              className="dashboard-botao-secundario dashboard-acao-perigosa"
              onClick={() =>
                onExcluirEntidade?.(
                  entidade
                )
              }
            >
              🗑 EXCLUIR PERMANENTEMENTE
            </button>

          )}

        </div>

      </details>
    );
  }


  function MenuArquivo({
    entidade
  }) {
    const podeRestaurar =
      podeEditarEntidade(
        campanha,
        entidade
      );


    const podeExcluir =
      podeExcluirEntidade(
        campanha,
        entidade
      );


    if (
      !podeRestaurar &&
      !podeExcluir &&
      !eMestre
    ) {
      return null;
    }


    return (
      <details className="dashboard-arquivo-menu">

        <summary
          title="Mais ações"
          aria-label="Mais ações"
        >
          ⋯
        </summary>


        <div className="dashboard-arquivo-menu-caixa">

          {eMestre && (

            <ClassificacaoEntidade
              entidade={
                entidade
              }
              podeAlterar
              modo="acao"
              onAlterar={
                onAlterarTipoEntidade
              }
            />

          )}


          {podeRestaurar && (

            <button
              type="button"
              onClick={() =>
                onRestaurarEntidade?.(
                  entidade
                )
              }
            >
              <span>
                ↩
              </span>

              Restaurar
            </button>

          )}


          {podeExcluir && (

            <button
              type="button"
              className="dashboard-arquivo-menu-perigo"
              onClick={() =>
                onExcluirEntidade?.(
                  entidade
                )
              }
            >
              <span>
                🗑
              </span>

              Excluir
            </button>

          )}

        </div>

      </details>
    );
  }


  function CardArea({
    icone,

    titulo,

    descricao,

    detalhe,

    area,

    disponivel = false,

    aoAbrir = null
  }) {
    function executar() {
      if (!disponivel) {
        return;
      }


      if (
        typeof aoAbrir ===
        "function"
      ) {
        aoAbrir();
        return;
      }


      onAbrirArea?.(
        area
      );
    }


    return (
      <article
        className={
          disponivel
            ? "dashboard-area-card dashboard-area-card-ativo"
            : "dashboard-area-card"
        }
      >

        <div className="dashboard-area-topo">

          <div className="dashboard-area-icone">
            {icone}
          </div>


          <div className="dashboard-area-texto">

            <h3>
              {titulo}
            </h3>


            <p>
              {descricao}
            </p>

          </div>

        </div>


        <div className="dashboard-area-rodape">

          <span className="dashboard-area-detalhe">
            {detalhe}
          </span>


          {disponivel ? (

            <button
              type="button"
              className="dashboard-botao-secundario"
              onClick={
                executar
              }
            >
              ABRIR →
            </button>

          ) : (

            <span className="dashboard-em-breve">
              EM BREVE
            </span>

          )}

        </div>

      </article>
    );
  }


  function CardPersonagemAtivo({
    personagem,

    compartilhado = false
  }) {
    const nomeProprietario =
      obterNomeProprietario(
        personagem
      );


    const mostrarProprietario =
      eMestre ||
      compartilhado;


    return (
      <article className="dashboard-personagem-card">

        <div className="dashboard-personagem-avatar">

          {personagem.imagem ? (

            <img
              src={
                personagem.imagem
              }
              alt={
                personagem.nome
              }
            />

          ) : (

            <span>
              👤
            </span>

          )}

        </div>


        <div className="dashboard-personagem-info">

          <div className="dashboard-personagem-nome-linha">

            <h3>
              {personagem.nome}
            </h3>


            <ClassificacaoEntidade
              entidade={
                personagem
              }
              podeAlterar={
                eMestre
              }
              onAlterar={
                onAlterarTipoEntidade
              }
            />

          </div>


          <p>
            {personagem.posicao ||
              personagem
                ?.informacoes
                ?.posicao ||
              "Sem posição"}
          </p>


          <span>
            Nível{" "}
            {personagem.nivel ||
              personagem
                ?.informacoes
                ?.nivel ||
              1}
          </span>


          {mostrarProprietario ? (

            <span>

              👤 {nomeProprietario}

              {" • "}

              {obterIconeVisibilidade(
                personagem
              )}{" "}

              {obterNomeVisibilidade(
                personagem
              )}

            </span>

          ) : (

            <span>

              {obterIconeVisibilidade(
                personagem
              )}{" "}

              {obterNomeVisibilidade(
                personagem
              )}

            </span>

          )}

        </div>


        <button
          type="button"
          className="dashboard-botao-secundario"
          onClick={() =>
            onAbrirEntidade?.(
              personagem,
              "dashboard"
            )
          }
        >
          ABRIR →
        </button>


        <MenuAcoesEntidade
          entidade={
            personagem
          }
        />

      </article>
    );
  }


  function ItemArquivo({
    entidade
  }) {
    const tipo =
      obterTipoEntidade(
        entidade
      );


    const motivo =
      entidade
        ?.ciclo
        ?.motivoEncerramento ||
      "Sem motivo informado";


    const data =
      formatarData(
        entidade
          ?.ciclo
          ?.encerradoEm
      );


    return (
      <article className="dashboard-arquivo-item">

        <div className="dashboard-arquivo-avatar">

          {entidade.imagem ? (

            <img
              src={
                entidade.imagem
              }
              alt={
                entidade.nome
              }
            />

          ) : (

            <span>
              {obterIconeTipo(
                tipo
              )}
            </span>

          )}

        </div>


        <div className="dashboard-arquivo-info">

          <div className="dashboard-arquivo-nome-linha">

            <h3>
              {entidade.nome}
            </h3>


            <ClassificacaoEntidade
              entidade={
                entidade
              }
              podeAlterar={
                eMestre
              }
              onAlterar={
                onAlterarTipoEntidade
              }
            />

          </div>


          <p>
            {motivo}
          </p>


          <div className="dashboard-arquivo-meta">

            {eMestre && (

              <span className="dashboard-arquivo-data">

                👤 Proprietário:{" "}

                {obterNomeProprietario(
                  entidade
                )}

              </span>

            )}


            <span className="dashboard-arquivo-data">

              {obterIconeVisibilidade(
                entidade
              )}{" "}

              Visibilidade:{" "}

              {obterNomeVisibilidade(
                entidade
              )}

            </span>

          </div>


          {data && (

            <span className="dashboard-arquivo-data dashboard-arquivo-data-bloco">
              📦 Arquivado em {data}
            </span>

          )}

        </div>


        <div className="dashboard-arquivo-acoes">

          <button
            type="button"
            className="dashboard-arquivo-visualizar"
            onClick={() =>
              onAbrirEntidade?.(
                entidade,
                "arquivos"
              )
            }
          >
            VISUALIZAR
          </button>


          <MenuArquivo
            entidade={
              entidade
            }
          />

        </div>

      </article>
    );
  }


  return (
    <div className="dashboard-campanha">

      <header className="dashboard-cabecalho">

        <div className="dashboard-identidade">

          <div className="dashboard-logo">
            ⚡
          </div>


          <div>

            <p className="dashboard-superior">
              RPG MANAGER
            </p>


            <h1>
              {campanha.nome}
            </h1>


            {campanha.descricao && (

              <p className="dashboard-descricao">
                {campanha.descricao}
              </p>

            )}

          </div>

        </div>


        <div className="dashboard-cabecalho-acoes">

          <span
            className={
              eMestre
                ? "dashboard-papel dashboard-papel-mestre"
                : "dashboard-papel dashboard-papel-jogador"
            }
          >
            {nomePapel}
          </span>


          {eColaborador && (

            <span className="dashboard-em-breve">
              COLABORADOR
            </span>

          )}


        </div>

      </header>


      <main className="dashboard-conteudo">

        {ultimaEntidade && (

          <section className="dashboard-continuar">

            <div>

              <p className="dashboard-secao-etiqueta">
                CONTINUAR
              </p>


              <h2>
                {ultimaEntidade.nome}
              </h2>


              <p className="dashboard-continuar-info">

                {ultimaEntidade.posicao ||
                  obterNomeTipo(
                    obterTipoEntidade(
                      ultimaEntidade
                    )
                  )}

                {" • "}

                Nível{" "}

                {ultimaEntidade.nivel ||
                  1}

              </p>

            </div>


            <button
              type="button"
              className="dashboard-botao-principal"
              disabled={
                !podeContinuar
              }
              onClick={() =>
                podeContinuar &&
                onContinuar(
                  ultimaEntidade,
                  "dashboard"
                )
              }
            >
              CONTINUAR →
            </button>

          </section>

        )}


        <section className="dashboard-secao">

          <div className="dashboard-secao-cabecalho">

            <div>

              <p className="dashboard-secao-etiqueta">
                {eMestre
                  ? "PERSONAGENS"
                  : "MINHAS FICHAS"}
              </p>


              <h2>
                {eMestre
                  ? "Personagens da campanha"
                  : "Seus personagens"}
              </h2>


              {!eMestre &&
                participanteAtual && (

                  <p className="dashboard-perfil-atual">

                    Perfil atual:{" "}

                    <strong>
                      {participanteAtual.nome}
                    </strong>

                  </p>

                )}

            </div>


            {podeCriarPersonagem && (

              <button
                type="button"
                className="dashboard-botao-principal dashboard-botao-menor"
                onClick={
                  onNovaFicha
                }
              >
                ＋ NOVA FICHA
              </button>

            )}

          </div>


          {personagensAtivos.length ===
            0 ? (

            <div className="dashboard-vazio">

              <h3>
                Nenhum personagem ativo
              </h3>

            </div>

          ) : (

            <div className="dashboard-personagens-grid">

              {personagensAtivos.map(
                personagem => (

                  <CardPersonagemAtivo
                    key={
                      personagem.id
                    }
                    personagem={
                      personagem
                    }
                  />

                )
              )}

            </div>

          )}

        </section>


        {!eMestre &&
          personagensCompartilhadosAtivos.length >
            0 && (

          <section className="dashboard-secao">

            <div className="dashboard-secao-cabecalho">

              <div>

                <p className="dashboard-secao-etiqueta">
                  VISÍVEIS NA CAMPANHA
                </p>


                <h2>
                  Outros personagens
                </h2>

              </div>

            </div>


            <div className="dashboard-personagens-grid">

              {personagensCompartilhadosAtivos.map(
                personagem => (

                  <CardPersonagemAtivo
                    key={
                      personagem.id
                    }
                    personagem={
                      personagem
                    }
                    compartilhado
                  />

                )
              )}

            </div>

          </section>

        )}


        <section className="dashboard-secao">

          <div className="dashboard-secao-cabecalho">

            <div>

              <p className="dashboard-secao-etiqueta">
                CAMPANHA
              </p>


              <h2>
                Visão geral
              </h2>

            </div>

          </div>


          <div className="dashboard-areas-grid">

            <CardArea
              icone="👥"
              titulo="Equipe"
              descricao="Membros, formação e organização da equipe."
              detalhe="Escalação, ritmo e organização coletiva"
              area="equipe"
              disponivel
            />


            <CardArea
              icone="🗺️"
              titulo="Jornada"
              descricao="Sessões, arcos e acontecimentos da campanha."
              detalhe="Histórico narrativo"
              area="jornada"
              disponivel
            />


            <CardArea
              icone="🤝"
              titulo="Vínculos"
              descricao="Relações, memórias e conexões entre personagens."
              detalhe="Benefícios e avanços narrativos"
              area="vinculos"
              disponivel
            />


            <CardArea
              icone="📝"
              titulo="Anotações"
              descricao="Ideias, lembretes e informações da campanha."
              detalhe={
                quantidadeAnotacoes ===
                1
                  ? "1 anotação visível"
                  : `${quantidadeAnotacoes} anotações visíveis`
              }
              area="anotacoes"
              disponivel
            />


            <CardArea
              icone="📁"
              titulo="Arquivos"
              descricao="Entidades preservadas e organizadas por categoria."
              detalhe={
                quantidadeArquivados ===
                1
                  ? "1 item arquivado"
                  : `${quantidadeArquivados} itens arquivados`
              }
              area="arquivos"
              disponivel
              aoAbrir={
                abrirArquivo
              }
            />

          </div>

        </section>


        {possuiAreaMestragem && (

          <section className="dashboard-secao">

            <div className="dashboard-secao-cabecalho">

              <div>

                <p className="dashboard-secao-etiqueta">

                  {eMestre
                    ? "MESTRAGEM"
                    : "COLABORAÇÃO"}

                </p>


                <h2>

                  {eMestre
                    ? "Ferramentas do Mestre"
                    : "Ferramentas liberadas"}

                </h2>

              </div>

            </div>


            <div className="dashboard-areas-grid">

              {podeCriarNPC && (

                <CardArea
                  icone="🎭"
                  titulo="NPCs"
                  descricao="Personagens organizados como NPCs da campanha."
                  detalhe={`${quantidadeNPCs} cadastrado${quantidadeNPCs === 1 ? "" : "s"}`}
                  area="npcs"
                  disponivel
                />

              )}


              {podeCriarAdversario && (

                <CardArea
                  icone="⚔️"
                  titulo="Adversários"
                  descricao="Entidades organizadas como oposição."
                  detalhe={`${quantidadeAdversarios} cadastrado${quantidadeAdversarios === 1 ? "" : "s"}`}
                  area="adversarios"
                  disponivel
                />

              )}


              {podeCriarMonstro && (

                <CardArea
                  icone="👹"
                  titulo="Monstros"
                  descricao="Criaturas e entidades desta categoria."
                  detalhe={`${quantidadeMonstros} cadastrado${quantidadeMonstros === 1 ? "" : "s"}`}
                  area="monstros"
                  disponivel
                />

              )}


              {podeCriarAuxiliar && (

                <CardArea
                  icone="🧰"
                  titulo="Auxiliares"
                  descricao="Entidades e recursos auxiliares."
                  detalhe={`${quantidadeAuxiliares} cadastrado${quantidadeAuxiliares === 1 ? "" : "s"}`}
                  area="auxiliares"
                  disponivel
                />

              )}

            </div>

          </section>

        )}


        {podeAdministrarCampanha && (

          <section className="dashboard-secao dashboard-administracao">

            <div>

              <p className="dashboard-secao-etiqueta">
                ADMINISTRAÇÃO
              </p>


              <h2>
                Configurações da campanha
              </h2>


              <p>
                Participantes, permissões,
                módulos e dados da campanha.
              </p>

            </div>


            <button
              type="button"
              className="dashboard-botao-secundario"
              onClick={onAbrirConfiguracoes}
            >
              ⚙ ABRIR →
            </button>

          </section>

        )}

      </main>


      {entidadeParaArquivar && (

        <div
          className="dashboard-modal-fundo"
          onMouseDown={
            fecharModalArquivamento
          }
        >

          <section
            className="dashboard-modal"
            onMouseDown={
              evento =>
                evento.stopPropagation()
            }
          >

            <div className="dashboard-modal-icone">
              📦
            </div>


            <div className="dashboard-modal-cabecalho">

              <p className="dashboard-secao-etiqueta">
                ARQUIVAR
              </p>


              <h2>
                {entidadeParaArquivar.nome}
              </h2>

            </div>


            <p className="dashboard-modal-texto">
              A entidade continuará preservada
              nos Arquivos da Campanha.
            </p>


            <label className="dashboard-modal-campo">

              <span>
                Motivo do arquivamento
              </span>


              <textarea
                value={
                  motivoArquivamento
                }
                onChange={
                  evento =>
                    setMotivoArquivamento(
                      evento.target.value
                    )
                }
                rows="4"
                autoFocus
              />

            </label>


            <div className="dashboard-modal-acoes">

              <button
                type="button"
                className="dashboard-botao-secundario"
                onClick={
                  fecharModalArquivamento
                }
              >
                CANCELAR
              </button>


              <button
                type="button"
                className="dashboard-botao-principal"
                onClick={
                  confirmarArquivamento
                }
              >
                📦 ARQUIVAR
              </button>

            </div>

          </section>

        </div>

      )}


      {arquivoAberto && (

        <div
          className="dashboard-modal-fundo"
          onMouseDown={
            fecharArquivo
          }
        >

          <section
            className="dashboard-arquivo-modal"
            onMouseDown={
              evento =>
                evento.stopPropagation()
            }
          >

            <header className="dashboard-arquivo-cabecalho">

              <div>

                <p className="dashboard-secao-etiqueta">
                  ARQUIVO
                </p>


                <h2>
                  Arquivos da Campanha
                </h2>


                <p>

                  {quantidadeArquivados}{" "}

                  item{
                    quantidadeArquivados ===
                    1
                      ? ""
                      : "s"
                  }{" "}

                  preservado{
                    quantidadeArquivados ===
                    1
                      ? ""
                      : "s"
                  }.

                </p>

              </div>


              <button
                type="button"
                className="dashboard-arquivo-fechar"
                onClick={
                  fecharArquivo
                }
              >
                ✕
              </button>

            </header>


            <div className="dashboard-arquivo-ferramentas">

              <label className="dashboard-arquivo-busca">

                <span>
                  🔎
                </span>


                <input
                  type="text"
                  value={
                    buscaArquivo
                  }
                  onChange={
                    evento =>
                      atualizarEstadoArquivo({
                        busca:
                          evento.target.value
                      })
                  }
                  placeholder="Buscar nos arquivados..."
                />

              </label>


              <select
                className="dashboard-arquivo-filtro"
                value={
                  filtroArquivo
                }
                onChange={
                  evento =>
                    atualizarEstadoArquivo({
                      filtro:
                        evento.target.value
                    })
                }
              >

                <option value="todos">
                  Todos os tipos
                </option>


                {tiposArquivados.map(
                  tipo => (

                    <option
                      key={
                        tipo
                      }
                      value={
                        tipo
                      }
                    >
                      {obterNomeTipoPlural(
                        tipo
                      )}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="dashboard-arquivo-lista">

              {gruposArquivo.length ===
                0 ? (

                <div className="dashboard-arquivo-vazio">

                  <span>
                    📁
                  </span>


                  <h3>
                    Nenhum item encontrado
                  </h3>

                </div>

              ) : (

                gruposArquivo.map(
                  grupo => (

                    <section
                      key={
                        grupo.tipo
                      }
                      className="dashboard-arquivo-grupo"
                    >

                      <header className="dashboard-arquivo-grupo-topo">

                        <div>

                          <span>
                            {obterIconeTipo(
                              grupo.tipo
                            )}
                          </span>


                          <strong>
                            {obterNomeTipoPlural(
                              grupo.tipo
                            )}
                          </strong>

                        </div>


                        <span>
                          {grupo.entidades.length}
                        </span>

                      </header>


                      {grupo.entidades.map(
                        (
                          entidade,
                          indice
                        ) => {
                          const letraAtual =
                            obterLetraInicial(
                              entidade
                            );


                          const letraAnterior =
                            indice > 0
                              ? obterLetraInicial(
                                  grupo.entidades[
                                    indice - 1
                                  ]
                                )
                              : null;


                          return (
                            <React.Fragment
                              key={
                                entidade.id
                              }
                            >

                              {letraAtual !==
                                letraAnterior && (

                                <div className="dashboard-arquivo-letra">
                                  {letraAtual}
                                </div>

                              )}


                              <ItemArquivo
                                entidade={
                                  entidade
                                }
                              />

                            </React.Fragment>
                          );
                        }
                      )}

                    </section>

                  )
                )

              )}

            </div>


            <footer className="dashboard-arquivo-rodape">

              <span>
                Separado por categoria e
                ordenado alfabeticamente.
              </span>


              <button
                type="button"
                className="dashboard-botao-secundario"
                onClick={
                  fecharArquivo
                }
              >
                FECHAR
              </button>

            </footer>

          </section>

        </div>

      )}

    </div>
  );
}


export default DashboardCampanha;
