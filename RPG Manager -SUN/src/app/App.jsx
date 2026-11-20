import React, {
  useEffect,
  useRef,
  useState
} from "react";

import "./App.css";
import { ManagerDirectory, ManagerHome, ManagerLayout, ManagerLoading } from "./ManagerLayout.jsx";
import ConfiguracoesCampanha from "../features/campanhas/ConfiguracoesCampanha.jsx";

import {
  CHAVE_FICHAS,
  atributosPadrao,
  fichaModelo,
  fichaOikawa
} from "../features/fichas/dados.js";

import {
  configuracaoCampanha,
  criarInformacoesIniciais,
  criarRecursosIniciais,
  criarEstadosIniciais,
  criarMomentumInicial,
  criarProgressaoInicial
} from "../features/campanhas/configCampanha.js";

import {
  CHAVE_CAMPANHAS,
  CHAVE_NAVEGACAO,
  CHAVE_SESSAO_NAVEGACAO,

  USUARIO_LOCAL_ID,
  USUARIO_LOCAL_NOME,

  PAPEIS_CAMPANHA,
  TIPOS_ENTIDADE,
  VISIBILIDADES_ENTIDADE,
  ESTADOS_CICLO_ENTIDADE,

  criarAcessoCampanha,
  criarParticipante,
  normalizarParticipante,

  criarCicloEntidadeInicial,
  normalizarCicloEntidade,
  entidadeEstaArquivada,

  possuiPermissao,
  podeVisualizarEntidade,
  podeEditarEntidade,
  podeExcluirEntidade,

  criarCampanhaSuperOnze,
  normalizarNavegacao
} from "../features/campanhas/campanhas.js";

import DashboardCampanha
  from "../features/campanhas/DashboardCampanha.jsx";

import AreaEntidades, {
  AREAS_ENTIDADES,
  encontrarAreaPorTipo
} from "../features/entidades/AreaEntidades.jsx";

import CriadorEntidade
  from "../features/entidades/CriadorEntidade.jsx";

import AnotacoesCampanha
  from "../features/campanhas/AnotacoesCampanha.jsx";

import { EquipeCampanha, JornadaCampanha, VinculosCampanha }
  from "../features/campanhas/ModulosCampanha.jsx";

import PrimeiroAcesso
  from "../features/campanhas/PrimeiroAcesso.jsx";

import MinhasCampanhas
  from "../features/campanhas/MinhasCampanhas.jsx";

import FichaDetalhes
  from "../features/fichas/FichaDetalhes.jsx";

import { AuthProvider, useAuth }
  from "../features/auth/AuthProvider.jsx";

import AuthScreen
  from "../features/auth/AuthScreen.jsx";

import {
  carregarCampanhasRemotas,
  hidratarBancosHissatsu,
  migrarBancosHissatsuLocais,
  convidarParticipante,
  criarCampanhaRemota,
  entrarEmCampanhaPorCodigo,
  removerParticipante,
  prepararCampanhasLocais,
  salvarCampanhasRemotas
} from "../lib/rpgManagerRepository.js";


const USUARIO_JOGADOR_LOCAL_ID =
  "jogador-local";

const USUARIO_JOGADOR_LOCAL_NOME =
  "Jogador local";


const ORIGENS_FICHA = {
  DASHBOARD: "dashboard",
  ARQUIVOS: "arquivos",
  NPCS: "npcs",
  ADVERSARIOS: "adversarios",
  MONSTROS: "monstros",
  AUXILIARES: "auxiliares",
  VINCULOS: "vinculos"
};


const AREA_ANOTACOES =
  "anotacoes";

const AREAS_CAMPANHA = new Set([
  "anotacoes",
  "equipe",
  "jornada",
  "vinculos",
  "configuracoes"
]);


function criarEstadoArquivoInicial() {
  return {
    aberto: false,
    busca: "",
    filtro: "todos"
  };
}


function primeiroDefinido(
  ...valores
) {
  return valores.find(
    valor =>
      valor !== undefined &&
      valor !== null
  );
}


function numeroSeguro(
  valor,
  padrao = 0
) {
  const numero =
    Number(valor);

  return Number.isNaN(numero)
    ? padrao
    : numero;
}


function normalizarAtributos(
  atributos
) {
  const resultado = {};


  Object.entries(
    atributos || {}
  ).forEach(
    ([nome, valor]) => {
      const numero =
        Number(valor);


      resultado[nome] =
        Number.isNaN(numero)
          ? 0
          : Math.max(
              0,
              numero
            );
    }
  );


  return resultado;
}


function normalizarNivel(
  valor
) {
  const numero =
    Number(valor);


  if (
    Number.isNaN(numero)
  ) {
    return 1;
  }


  return Math.max(
    1,
    Math.floor(numero)
  );
}


function normalizarInformacoes(
  ficha
) {
  const padrao = {
    ...criarInformacoesIniciais(),

    posicao:
      configuracaoCampanha
        .posicaoInicial,

    experienciaMax:
      100
  };


  const salvas =
    ficha.informacoes ||
    {};


  return {
    ...padrao,
    ...salvas,

    idade:
      Math.max(
        0,
        numeroSeguro(
          primeiroDefinido(
            salvas.idade,
            ficha.idade,
            padrao.idade
          ),
          0
        )
      ),

    altura:
      primeiroDefinido(
        salvas.altura,
        ficha.altura,
        padrao.altura
      ),

    peDominante:
      primeiroDefinido(
        salvas.peDominante,
        ficha.peDominante,
        padrao.peDominante
      ),

    raca:
      primeiroDefinido(
        salvas.raca,
        ficha.raca,
        padrao.raca
      ),

    nivel:
      normalizarNivel(
        primeiroDefinido(
          salvas.nivel,
          ficha.nivel,
          padrao.nivel
        )
      ),

    experiencia:
      Math.max(
        0,
        numeroSeguro(
          primeiroDefinido(
            salvas.experiencia,
            ficha.experiencia,
            padrao.experiencia
          ),
          0
        )
      ),

    experienciaMax:
      Math.max(
        1,
        numeroSeguro(
          primeiroDefinido(
            salvas.experienciaMax,
            ficha.experienciaMax,
            padrao.experienciaMax
          ),
          100
        )
      ),

    posicao:
      primeiroDefinido(
        salvas.posicao,
        ficha.posicao,
        padrao.posicao
      )
  };
}


function normalizarRecursos(
  ficha
) {
  const recursosPadrao =
    criarRecursosIniciais();


  const resultado = {};


  Object.entries(
    recursosPadrao
  ).forEach(
    ([
      chave,
      recursoPadrao
    ]) => {
      const recursoSalvo =
        ficha.recursos?.[chave] ||
        {};


      let valorAntigoAtual;
      let valorAntigoMaximo;


      if (
        chave ===
        "vida"
      ) {
        valorAntigoAtual =
          ficha.vida;

        valorAntigoMaximo =
          ficha.vidaMax;
      }


      if (
        chave ===
        "tp"
      ) {
        valorAntigoAtual =
          ficha.tp;

        valorAntigoMaximo =
          ficha.tpMax;
      }


      const maximo =
        Math.max(
          0,
          numeroSeguro(
            primeiroDefinido(
              recursoSalvo.maximo,
              valorAntigoMaximo,
              recursoPadrao.maximo
            ),
            recursoPadrao.maximo
          )
        );


      const atual =
        Math.min(
          maximo,
          Math.max(
            0,
            numeroSeguro(
              primeiroDefinido(
                recursoSalvo.atual,
                valorAntigoAtual,
                recursoPadrao.atual
              ),
              recursoPadrao.atual
            )
          )
        );


      resultado[chave] = {
        ...recursoSalvo,
        atual,
        maximo
      };
    }
  );


  Object.entries(
    ficha.recursos ||
    {}
  ).forEach(
    ([chave, recurso]) => {
      if (
        chave ===
        "resistencia"
      ) {
        return;
      }


      if (
        !resultado[chave]
      ) {
        const maximo =
          Math.max(
            0,
            numeroSeguro(
              recurso?.maximo,
              0
            )
          );


        const atual =
          Math.min(
            maximo,
            Math.max(
              0,
              numeroSeguro(
                recurso?.atual,
                0
              )
            )
          );


        resultado[chave] = {
          ...recurso,
          atual,
          maximo
        };
      }
    }
  );


  return resultado;
}


function normalizarEstados(
  ficha
) {
  const padrao =
    criarEstadosIniciais();


  const salvos =
    ficha.estados ||
    {};


  const {
    momentum:
      momentumAntigoIgnorado,

    ...outrosEstados
  } = salvos;


  void momentumAntigoIgnorado;


  return {
    ...padrao,
    ...outrosEstados,

    fisico:
      primeiroDefinido(
        salvos.fisico,
        padrao.fisico,
        "Normal"
      ),

    mental:
      primeiroDefinido(
        salvos.mental,
        padrao.mental,
        "Estável"
      )
  };
}


function obterMomentumNumerico(
  ficha
) {
  if (
    typeof ficha?.momentum ===
    "number"
  ) {
    return Math.max(
      0,
      ficha.momentum
    );
  }


  if (
    typeof ficha
      ?.estados
      ?.momentum ===
    "number"
  ) {
    return Math.max(
      0,
      ficha.estados.momentum
    );
  }


  return criarMomentumInicial()
    .atual;
}


function obterMomentumMaximo(
  ficha
) {
  if (
    typeof ficha?.momentumMax ===
    "number"
  ) {
    return Math.max(
      0,
      ficha.momentumMax
    );
  }


  return criarMomentumInicial()
    .maximo;
}


function normalizarArquetipoId(
  ficha
) {
  if (
    typeof ficha?.arquetipoId ===
    "string" &&
    ficha.arquetipoId.trim()
  ) {
    return ficha.arquetipoId;
  }


  if (
    typeof ficha?.arquetipo ===
    "string" &&
    ficha.arquetipo.trim()
  ) {
    return ficha.arquetipo;
  }


  if (
    typeof ficha
      ?.arquetipo
      ?.id ===
    "string" &&
    ficha.arquetipo.id.trim()
  ) {
    return ficha.arquetipo.id;
  }


  return null;
}


function normalizarArquetiposAdquiridos(
  ficha
) {
  const resultado = [];

  const encontrados =
    new Set();


  function adicionar(
    valor
  ) {
    if (!valor) {
      return;
    }


    const id =
      typeof valor ===
      "string"
        ? valor
        : valor?.id;


    if (
      typeof id !==
        "string" ||
      !id.trim() ||
      encontrados.has(
        id
      )
    ) {
      return;
    }


    encontrados.add(
      id
    );


    if (
      typeof valor ===
      "object"
    ) {
      resultado.push({
        ...valor,
        id
      });

      return;
    }


    resultado.push({
      id
    });
  }


  if (
    Array.isArray(
      ficha?.arquetiposAdquiridos
    )
  ) {
    ficha.arquetiposAdquiridos
      .forEach(
        adicionar
      );
  }


  if (
    Array.isArray(
      ficha?.arquetipos
    )
  ) {
    ficha.arquetipos
      .forEach(
        adicionar
      );
  }


  const destaque =
    normalizarArquetipoId(
      ficha
    );


  if (destaque) {
    adicionar({
      id:
        destaque,

      adquiridoEmNivel:
        primeiroDefinido(
          ficha
            ?.informacoes
            ?.nivel,
          ficha?.nivel,
          null
        )
    });
  }


  return resultado;
}


function obterIdTalento(
  valor
) {
  if (
    typeof valor ===
    "string"
  ) {
    const id =
      valor.trim();


    return id ||
      null;
  }


  if (
    typeof valor ===
      "object" &&
    valor
  ) {
    const id =
      String(
        valor.id ||
        valor.talentoId ||
        ""
      ).trim();


    return id ||
      null;
  }


  return null;
}


function normalizarGrauTalento(
  valor
) {
  const numero =
    Number(valor);


  if (
    Number.isNaN(
      numero
    )
  ) {
    return 1;
  }


  return Math.max(
    1,
    Math.floor(
      numero
    )
  );
}


function normalizarTalentos(
  ficha
) {
  const origem =
    Array.isArray(
      ficha?.talentosPosicionais
    )
      ? ficha.talentosPosicionais
      : (
        Array.isArray(
          ficha?.talentos
        )
          ? ficha.talentos
          : []
      );


  const resultado = [];

  const encontrados =
    new Set();


  origem.forEach(
    valor => {
      const id =
        obterIdTalento(
          valor
        );


      if (
        !id ||
        encontrados.has(
          id
        )
      ) {
        return;
      }


      encontrados.add(
        id
      );


      if (
        typeof valor ===
        "string"
      ) {
        resultado.push(
          id
        );

        return;
      }


      resultado.push({
        ...valor,

        id,

        grau:
          normalizarGrauTalento(
            valor.grau
          ),

        observacaoEvolucao:
          typeof valor
            ?.observacaoEvolucao ===
          "string"
            ? valor.observacaoEvolucao
            : ""
      });
    }
  );


  return resultado;
}


function normalizarFicha(
  ficha,
  campanhaId =
    configuracaoCampanha.id,
  proprietarioPadrao =
    USUARIO_LOCAL_ID
) {
  const informacoes =
    normalizarInformacoes(
      ficha
    );


  const recursos =
    normalizarRecursos(
      ficha
    );


  const estados =
    normalizarEstados(
      ficha
    );


  const momentum =
    obterMomentumNumerico(
      ficha
    );


  const momentumMax =
    obterMomentumMaximo(
      ficha
    );


  const atributosSalvos =
    normalizarAtributos(
      ficha.atributos
    );


  if (
    !Object.prototype
      .hasOwnProperty
      .call(
        atributosSalvos,
        "resistencia"
      )
  ) {
    const resistenciaAntiga =
      primeiroDefinido(
        ficha
          ?.recursos
          ?.resistencia
          ?.maximo,

        ficha
          ?.recursos
          ?.resistencia
          ?.atual
      );


    if (
      resistenciaAntiga !==
        undefined &&
      resistenciaAntiga !==
        null
    ) {
      atributosSalvos.resistencia =
        Math.max(
          0,
          numeroSeguro(
            resistenciaAntiga,
            0
          )
        );
    }
  }


  const arquetiposAdquiridos =
    normalizarArquetiposAdquiridos(
      ficha
    );


  const arquetipoId =
    normalizarArquetipoId(
      ficha
    ) ||
    arquetiposAdquiridos[
      0
    ]?.id ||
    null;


  return {
    ...fichaModelo,
    ...ficha,

    campanhaId,

    tipoEntidade:
      ficha.tipoEntidade ||
      TIPOS_ENTIDADE.PERSONAGEM,

    proprietarioId:
      ficha.proprietarioId ||
      proprietarioPadrao,

    visibilidade:
      ficha.visibilidade ||
      VISIBILIDADES_ENTIDADE.CAMPANHA,

    participantesPermitidos:
      Array.isArray(
        ficha.participantesPermitidos
      )
        ? ficha.participantesPermitidos
        : [],

    ciclo:
      normalizarCicloEntidade(
        ficha.ciclo
      ),

    idade:
      informacoes.idade,

    altura:
      informacoes.altura,

    peDominante:
      informacoes.peDominante,

    raca:
      informacoes.raca,

    nivel:
      informacoes.nivel,

    experiencia:
      informacoes.experiencia,

    experienciaMax:
      informacoes.experienciaMax,

    posicao:
      informacoes.posicao,

    informacoes,

    vida:
      recursos.vida?.atual ??
      0,

    vidaMax:
      recursos.vida?.maximo ??
      0,

    tp:
      recursos.tp?.atual ??
      0,

    tpMax:
      recursos.tp?.maximo ??
      0,

    momentum,
    momentumMax,

    recursos,
    estados,

    atributos: {
      ...atributosPadrao,
      ...atributosSalvos
    },

    arquetipoId,

    arquetiposAdquiridos,

    talentosPosicionais:
      normalizarTalentos(
        ficha
      ),

    habilidades:
      Array.isArray(
        ficha.habilidades
      )
        ? ficha.habilidades
        : [],

    vinculos:
      Array.isArray(ficha.vinculos)
        ? ficha.vinculos
        : [],

    evolucao:
      Array.isArray(ficha.evolucao)
        ? ficha.evolucao
        : [],

    inventario:
      Array.isArray(ficha.inventario)
        ? ficha.inventario
        : []
  };
}


function normalizarAnotacao(
  anotacao,
  proprietarioPadrao
) {
  const agora =
    Date.now();


  return {
    id:
      anotacao?.id ||
      `nota-${agora}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    titulo:
      typeof anotacao?.titulo ===
      "string"
        ? anotacao.titulo
        : "",

    texto:
      typeof anotacao?.texto ===
      "string"
        ? anotacao.texto
        : "",

    proprietarioId:
      anotacao
        ?.proprietarioId ||
      proprietarioPadrao,

    visibilidade:
      anotacao
        ?.visibilidade ||
      VISIBILIDADES_ENTIDADE.PROPRIETARIO,

    participantesPermitidos:
      Array.isArray(
        anotacao
          ?.participantesPermitidos
      )
        ? anotacao
            .participantesPermitidos
        : [],

    fixada:
      Boolean(
        anotacao?.fixada
      ),

    tags:
      Array.isArray(anotacao?.tags)
        ? anotacao.tags
        : [],

    criadaEm:
      anotacao?.criadaEm ||
      agora,

    atualizadaEm:
      anotacao?.atualizadaEm ||
      anotacao?.criadaEm ||
      agora
  };
}


function normalizarCampanha(
  campanha
) {
  const id =
    campanha?.id ||
    configuracaoCampanha.id;


  const usuarioAtualId =
    campanha?.usuarioAtualId ||
    USUARIO_LOCAL_ID;


  const papelAntigo =
    campanha
      ?.acesso
      ?.papel ||
    PAPEIS_CAMPANHA.MESTRE;


  const permissoesAntigas =
    campanha
      ?.acesso
      ?.permissoes ||
    {};


  let participantes =
    Array.isArray(
      campanha?.participantes
    )
      ? campanha.participantes
          .map(
            participante =>
              normalizarParticipante(
                participante
              )
          )
          .filter(Boolean)
      : [];


  let participanteLocal =
    participantes.find(
      participante =>
        participante.id ===
        USUARIO_LOCAL_ID
    );


  if (!participanteLocal) {
    participanteLocal =
      criarParticipante({
        id:
          USUARIO_LOCAL_ID,

        nome:
          USUARIO_LOCAL_NOME,

        papel:
          PAPEIS_CAMPANHA.MESTRE
      });


    participantes = [
      ...participantes,
      participanteLocal
    ];
  }


  if (
    !participantes.some(
      participante =>
        participante.id ===
        USUARIO_JOGADOR_LOCAL_ID
    )
  ) {
    participantes = [
      ...participantes,

      criarParticipante({
        id:
          USUARIO_JOGADOR_LOCAL_ID,

        nome:
          USUARIO_JOGADOR_LOCAL_NOME,

        papel:
          PAPEIS_CAMPANHA.JOGADOR
      })
    ];
  }


  let participanteAtual =
    participantes.find(
      participante =>
        participante.id ===
        usuarioAtualId
    );


  if (!participanteAtual) {
    participanteAtual =
      participanteLocal;
  }


  const acesso =
    participanteAtual?.acesso ||
    criarAcessoCampanha(
      papelAntigo,
      permissoesAntigas
    );


  const entidades =
    Array.isArray(
      campanha?.entidades
    )
      ? campanha.entidades.map(
          entidade =>
            normalizarFicha(
              entidade,
              id,
              USUARIO_LOCAL_ID
            )
        )
      : [];


  const anotacoes =
    Array.isArray(
      campanha?.anotacoes
    )
      ? campanha.anotacoes.map(
          anotacao =>
            normalizarAnotacao(
              anotacao,
              USUARIO_LOCAL_ID
            )
        )
      : [];


  return {
    id,

    ownerUserId:
      campanha?.ownerUserId ||
      usuarioAtualId,

    nome:
      campanha?.nome ||
      configuracaoCampanha.nome,

    descricao:
      campanha?.descricao ||
      "",

    configuracaoId:
      campanha?.configuracaoId ||
      configuracaoCampanha.id,

    usuarioAtualId:
      participanteAtual.id,

    participantes,

    acesso,

    entidades,

    anotacoes,

    equipe:
      campanha?.equipe ??
      null,

    jornada:
      campanha?.jornada ??
      null,

    vinculos:
      Array.isArray(
        campanha?.vinculos
      )
        ? campanha.vinculos
        : [],

    criadaEm:
      campanha?.criadaEm ||
      Date.now(),

    atualizadaEm:
      campanha?.atualizadaEm ||
      Date.now()
  };
}


function migrarFichasAntigas() {
  try {
    const dadosAntigos =
      localStorage.getItem(
        CHAVE_FICHAS
      );


    if (!dadosAntigos) {
      return [
        normalizarFicha(
          fichaOikawa
        )
      ];
    }


    const fichas =
      JSON.parse(
        dadosAntigos
      );


    if (
      !Array.isArray(
        fichas
      )
    ) {
      return [
        normalizarFicha(
          fichaOikawa
        )
      ];
    }


    return fichas.map(
      ficha =>
        normalizarFicha(
          ficha,
          configuracaoCampanha.id,
          USUARIO_LOCAL_ID
        )
    );

  } catch (erro) {
    console.error(
      "Erro ao migrar fichas:",
      erro
    );


    return [
      normalizarFicha(
        fichaOikawa
      )
    ];
  }
}


function carregarCampanhas() {
  try {
    const salvas =
      localStorage.getItem(
        CHAVE_CAMPANHAS
      );


    if (salvas) {
      const dados =
        JSON.parse(
          salvas
        );


      if (
        Array.isArray(
          dados
        ) &&
        dados.length >
        0
      ) {
        return dados.map(
          normalizarCampanha
        );
      }
    }


    return [
      normalizarCampanha(
        criarCampanhaSuperOnze(
          migrarFichasAntigas()
        )
      )
    ];

  } catch (erro) {
    console.error(
      "Erro ao carregar campanhas:",
      erro
    );


    return [
      normalizarCampanha(
        criarCampanhaSuperOnze([
          normalizarFicha(
            fichaOikawa
          )
        ])
      )
    ];
  }
}


function carregarNavegacaoDuradoura() {
  try {
    const dados =
      localStorage.getItem(
        CHAVE_NAVEGACAO
      );


    return dados
      ? normalizarNavegacao(
          JSON.parse(
            dados
          )
        )
      : normalizarNavegacao(
          null
        );

  } catch {
    return normalizarNavegacao(
      null
    );
  }
}


function carregarNavegacaoSessao() {
  try {
    const dados =
      sessionStorage.getItem(
        CHAVE_SESSAO_NAVEGACAO
      );


    if (!dados) {
      return null;
    }


    const bruto =
      JSON.parse(
        dados
      );


    const base =
      normalizarNavegacao(
        bruto
      );


    return {
      ...base,

      origemFicha:
        Object.values(
          ORIGENS_FICHA
        ).includes(
          bruto?.origemFicha
        )
          ? bruto.origemFicha
          : ORIGENS_FICHA.DASHBOARD,

      areaEntidadesAtiva:
        AREAS_ENTIDADES[
          bruto?.areaEntidadesAtiva
        ]
          ? bruto.areaEntidadesAtiva
          : null,

      areaCampanhaAtiva:
        AREAS_CAMPANHA.has(
          bruto?.areaCampanhaAtiva
        )
          ? bruto.areaCampanhaAtiva
          : null,

      arquivo: {
        aberto:
          Boolean(
            bruto
              ?.arquivo
              ?.aberto
          ),

        busca:
          typeof bruto
            ?.arquivo
            ?.busca ===
          "string"
            ? bruto.arquivo.busca
            : "",

        filtro:
          typeof bruto
            ?.arquivo
            ?.filtro ===
          "string"
            ? bruto.arquivo.filtro
            : "todos"
      }
    };

  } catch {
    return null;
  }
}


function criarEstadoNovaFicha(
  visibilidade =
    VISIBILIDADES_ENTIDADE.CAMPANHA
) {
  const informacoes = {
    ...criarInformacoesIniciais(),

    posicao:
      configuracaoCampanha
        .posicaoInicial,

    experienciaMax:
      100
  };


  const recursos =
    criarRecursosIniciais();


  const momentum =
    criarMomentumInicial();


  const progressao =
    criarProgressaoInicial();


  return {
    nome: "",
    imagem: "",

    visibilidade,

    idade:
      informacoes.idade,

    altura:
      informacoes.altura,

    peDominante:
      informacoes.peDominante,

    raca:
      informacoes.raca,

    nivel:
      informacoes.nivel,

    experiencia:
      informacoes.experiencia,

    experienciaMax:
      informacoes.experienciaMax,

    posicao:
      informacoes.posicao,

    vidaMax:
      recursos.vida?.maximo ??
      100,

    tpMax:
      recursos.tp?.maximo ??
      100,

    momentum:
      momentum.atual,

    momentumMax:
      momentum.maximo,

    informacoes,

    recursos,

    estados:
      criarEstadosIniciais(),

    atributos: {
      ...atributosPadrao
    },

    ...progressao,

    arquetiposAdquiridos:
      []
  };
}


function RPGManager({ usuario, sair }) {
  const inputFotoRef =
    useRef(null);


  const [
    navegacaoDuradoura
  ] = useState(
    carregarNavegacaoDuradoura
  );


  const [
    navegacaoSessao
  ] = useState(
    carregarNavegacaoSessao
  );


  const [
    campanhas,
    setCampanhas
  ] = useState(
    []
  );

  const [
    dadosRemotosCarregados,
    setDadosRemotosCarregados
  ] = useState(false);

  const [
    erroPersistencia,
    setErroPersistencia
  ] = useState("");

  const [telaPainel, setTelaPainel] = useState("inicio");


  const [
    campanhaAtivaId,
    setCampanhaAtivaId
  ] = useState(
    navegacaoSessao
      ?.campanhaAtivaId ||
    navegacaoDuradoura
      .campanhaAtivaId ||
    configuracaoCampanha.id
  );


  const [
    fichaAberta,
    setFichaAberta
  ] = useState(
    navegacaoSessao
      ?.tela ===
    "ficha"
      ? navegacaoSessao
          .entidadeAtivaId
      : null
  );


  const [
    ultimaEntidadeId,
    setUltimaEntidadeId
  ] = useState(
    navegacaoDuradoura
      .entidadeAtivaId ??
    null
  );


  const [
    origemFicha,
    setOrigemFicha
  ] = useState(
    navegacaoSessao
      ?.origemFicha ||
    ORIGENS_FICHA.DASHBOARD
  );


  const [
    areaEntidadesAtiva,
    setAreaEntidadesAtiva
  ] = useState(
    navegacaoSessao
      ?.areaEntidadesAtiva ||
    null
  );


  const [
    areaCampanhaAtiva,
    setAreaCampanhaAtiva
  ] = useState(
    navegacaoSessao
      ?.areaCampanhaAtiva ||
    null
  );


  const [
    estadoArquivo,
    setEstadoArquivo
  ] = useState(
    () => ({
      ...criarEstadoArquivoInicial(),

      ...(
        navegacaoSessao
          ?.arquivo ||
        {}
      )
    })
  );


  const [
    criandoFicha,
    setCriandoFicha
  ] = useState(false);


  const [
    editandoFicha,
    setEditandoFicha
  ] = useState(false);


  const [
    tipoEntidadeEdicao,
    setTipoEntidadeEdicao
  ] = useState(
    TIPOS_ENTIDADE.PERSONAGEM
  );


  const [
    novaFicha,
    setNovaFicha
  ] = useState(
    criarEstadoNovaFicha
  );


  const campanhaAtual =
    campanhas.find(
      campanha =>
        campanha.id ===
        campanhaAtivaId
    ) ||
    campanhas[0] ||
    null;


  const idCampanhaAtual =
    campanhaAtual?.id ??
    null;


  const usuarioAtualId =
    campanhaAtual
      ?.usuarioAtualId ||
    usuario.id;


  const eMestreAtual =
    campanhaAtual
      ?.acesso
      ?.papel ===
    PAPEIS_CAMPANHA.MESTRE;


  const fichas =
    campanhaAtual
      ?.entidades ||
    [];


  function obterNomeParticipante(
    participanteId
  ) {
    return (
      campanhaAtual
        ?.participantes
        ?.find(
          participante =>
            participante.id ===
            participanteId
        )
        ?.nome ||
      "Não identificado"
    );
  }


  function setFichas(
    atualizador
  ) {
    if (
      !idCampanhaAtual
    ) {
      return;
    }


    setCampanhas(
      anteriores =>
        anteriores.map(
          campanha => {
            if (
              campanha.id !==
              idCampanhaAtual
            ) {
              return campanha;
            }


            const atuais =
              campanha.entidades ||
              [];


            const novas =
              typeof atualizador ===
              "function"
                ? atualizador(
                    atuais
                  )
                : atualizador;


            return {
              ...campanha,

              entidades:
                novas,

              atualizadaEm:
                Date.now()
            };
          }
        )
    );
  }


  function salvarModuloFicha(campo, valor) {
    if (!fichaAtual || !podeEditarEntidade(campanhaAtual, fichaAtual)) return;

    setFichas(atuais =>
      atuais.map(entidade =>
        entidade.id === fichaAtual.id
          ? { ...entidade, [campo]: valor, atualizadoEm: Date.now() }
          : entidade
      )
    );
  }


  function podeAcessarFicha(
    ficha
  ) {
    return (
      campanhaAtual &&
      ficha &&
      podeVisualizarEntidade(
        campanhaAtual,
        ficha
      )
    );
  }


  const fichaCandidata =
    fichas.find(
      ficha =>
        ficha.id ===
        fichaAberta
    ) ||
    null;


  const fichaAtual =
    fichaCandidata &&
    podeAcessarFicha(
      fichaCandidata
    )
      ? fichaCandidata
      : null;


  const ultimaCandidata =
    fichas.find(
      ficha =>
        ficha.id ===
          ultimaEntidadeId &&
        !entidadeEstaArquivada(
          ficha
        )
    ) ||
    null;


  const ultimaEntidade =
    ultimaCandidata &&
    podeAcessarFicha(
      ultimaCandidata
    )
      ? ultimaCandidata
      : null;


  function podeVisualizarAnotacao(
    anotacao
  ) {
    if (!anotacao) {
      return false;
    }


    if (
      anotacao.proprietarioId ===
      usuarioAtualId
    ) {
      return true;
    }


    if (
      anotacao.visibilidade ===
      VISIBILIDADES_ENTIDADE.CAMPANHA
    ) {
      return true;
    }


    if (
      anotacao.visibilidade ===
      VISIBILIDADES_ENTIDADE.MESTRE
    ) {
      return eMestreAtual;
    }


    if (
      anotacao.visibilidade ===
      VISIBILIDADES_ENTIDADE.RESTRITA
    ) {
      return (
        Array.isArray(
          anotacao.participantesPermitidos
        ) &&
        anotacao.participantesPermitidos.includes(
          usuarioAtualId
        )
      );
    }


    return false;
  }


  const anotacoesVisiveis =
    (
      campanhaAtual
        ?.anotacoes ||
      []
    ).filter(
      podeVisualizarAnotacao
    );


  async function recarregarCampanhas() {
    const remotas = await carregarCampanhasRemotas(usuario.id);
    setCampanhas(remotas.map(normalizarCampanha));
  }


  async function convidarJogador(username) {
    await convidarParticipante(idCampanhaAtual, username);
    await recarregarCampanhas();
  }


  async function removerJogador(participanteId) {
    await removerParticipante(idCampanhaAtual, participanteId);
    await recarregarCampanhas();
  }


  function alterarPermissaoParticipante(
    participanteId,
    permissao,
    valor
  ) {
    const novoValor =
      Boolean(valor);


    setCampanhas(
      anteriores =>
        anteriores.map(
          campanha => {
            if (
              campanha.id !==
              idCampanhaAtual
            ) {
              return campanha;
            }


            let novoAcessoAtual =
              null;


            const participantes =
              (
                campanha.participantes ||
                []
              ).map(
                participante => {
                  if (
                    participante.id !==
                    participanteId
                  ) {
                    return participante;
                  }


                  const atualizado = {
                    ...participante,

                    permissoesExtras: {
                      ...(
                        participante
                          .permissoesExtras ||
                        {}
                      ),

                      [permissao]:
                        novoValor
                    },

                    acesso: {
                      ...(
                        participante.acesso ||
                        {}
                      ),

                      permissoes: {
                        ...(
                          participante
                            ?.acesso
                            ?.permissoes ||
                          {}
                        ),

                        [permissao]:
                          novoValor
                      }
                    }
                  };


                  novoAcessoAtual =
                    atualizado.acesso;


                  return atualizado;
                }
              );


            return {
              ...campanha,

              participantes,

              acesso:
                campanha.usuarioAtualId ===
                  participanteId &&
                novoAcessoAtual
                  ? novoAcessoAtual
                  : campanha.acesso,

              atualizadaEm:
                Date.now()
            };
          }
        )
    );
  }


  function alterarVisibilidadeFicha(
    ficha,
    visibilidade
  ) {
    if (
      !campanhaAtual ||
      !ficha ||
      !podeEditarEntidade(
        campanhaAtual,
        ficha
      )
    ) {
      return;
    }


    if (
      !Object.values(
        VISIBILIDADES_ENTIDADE
      ).includes(
        visibilidade
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          item =>
            item.id ===
            ficha.id
              ? {
                  ...item,
                  visibilidade
                }
              : item
        )
    );
  }


  function alterarTipoEntidade(
    ficha,
    novoTipo
  ) {
    if (
      !eMestreAtual ||
      !ficha
    ) {
      return;
    }


    if (
      !Object.values(
        TIPOS_ENTIDADE
      ).includes(
        novoTipo
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          entidade =>
            entidade.id ===
            ficha.id
              ? {
                  ...entidade,

                  tipoEntidade:
                    novoTipo
                }
              : entidade
        )
    );
  }


  function abrirArea(
    area
  ) {
    if (
      AREAS_CAMPANHA.has(area)
    ) {
      setFichaAberta(null);
      setCriandoFicha(false);
      setEditandoFicha(false);

      setAreaEntidadesAtiva(
        null
      );

      setAreaCampanhaAtiva(
        area
      );

      setEstadoArquivo(
        anterior => ({
          ...anterior,
          aberto: false
        })
      );

      return;
    }


    const configuracao =
      AREAS_ENTIDADES[
        area
      ];


    if (
      !configuracao ||
      !possuiPermissao(
        campanhaAtual,
        configuracao.permissao
      )
    ) {
      return;
    }


    setFichaAberta(null);
    setCriandoFicha(false);
    setEditandoFicha(false);

    setAreaCampanhaAtiva(null);

    setAreaEntidadesAtiva(
      area
    );

    setOrigemFicha(area);

    setEstadoArquivo(
      anterior => ({
        ...anterior,
        aberto: false
      })
    );
  }


  function abrirFicha(
    ficha,
    origem =
      ORIGENS_FICHA.DASHBOARD
  ) {
    if (
      !ficha ||
      !podeAcessarFicha(
        ficha
      )
    ) {
      return;
    }


    const origemValida =
      Object.values(
        ORIGENS_FICHA
      ).includes(
        origem
      )
        ? origem
        : ORIGENS_FICHA.DASHBOARD;


    setOrigemFicha(
      origemValida
    );


    setAreaCampanhaAtiva(
      null
    );


    if (
      AREAS_ENTIDADES[
        origemValida
      ]
    ) {
      setAreaEntidadesAtiva(
        origemValida
      );

    } else {
      setAreaEntidadesAtiva(
        null
      );
    }


    if (
      origemValida !==
      ORIGENS_FICHA.ARQUIVOS
    ) {
      setEstadoArquivo(
        anterior => ({
          ...anterior,
          aberto: false
        })
      );
    }


    if (
      !entidadeEstaArquivada(
        ficha
      )
    ) {
      setUltimaEntidadeId(
        ficha.id
      );
    }


    setFichaAberta(
      ficha.id
    );
  }


  function voltarDaFicha() {
    setFichaAberta(null);


    if (
      origemFicha ===
      ORIGENS_FICHA.ARQUIVOS
    ) {
      setAreaEntidadesAtiva(
        null
      );

      setEstadoArquivo(
        anterior => ({
          ...anterior,
          aberto: true
        })
      );

      return;
    }


    if (
      AREAS_ENTIDADES[
        origemFicha
      ]
    ) {
      setAreaEntidadesAtiva(
        origemFicha
      );

      return;
    }


    if (origemFicha === ORIGENS_FICHA.VINCULOS) {
      setAreaCampanhaAtiva("vinculos");
      setAreaEntidadesAtiva(null);
      return;
    }


    setAreaEntidadesAtiva(
      null
    );
  }


  function arquivarFicha(
    ficha,
    motivo = ""
  ) {
    if (
      !campanhaAtual ||
      !ficha ||
      !podeEditarEntidade(
        campanhaAtual,
        ficha
      ) ||
      entidadeEstaArquivada(
        ficha
      )
    ) {
      return;
    }


    const motivoFinal =
      String(
        motivo ||
        ""
      ).trim() ||
      "Não informado";


    const agora =
      Date.now();


    setFichas(
      anteriores =>
        anteriores.map(
          item => {
            if (
              item.id !==
              ficha.id
            ) {
              return item;
            }


            const ciclo =
              normalizarCicloEntidade(
                item.ciclo
              );


            return {
              ...item,

              ciclo: {
                ...ciclo,

                estado:
                  ESTADOS_CICLO_ENTIDADE.ARQUIVADO,

                motivoEncerramento:
                  motivoFinal,

                encerradoEm:
                  agora,

                historico: [
                  ...ciclo.historico,

                  {
                    tipo:
                      "arquivamento",

                    motivo:
                      motivoFinal,

                    em:
                      agora
                  }
                ]
              }
            };
          }
        )
    );


    if (
      fichaAberta ===
      ficha.id
    ) {
      setFichaAberta(null);
    }


    if (
      ultimaEntidadeId ===
      ficha.id
    ) {
      setUltimaEntidadeId(null);
    }
  }


  function restaurarFicha(
    ficha
  ) {
    if (
      !campanhaAtual ||
      !ficha ||
      !podeEditarEntidade(
        campanhaAtual,
        ficha
      ) ||
      !entidadeEstaArquivada(
        ficha
      )
    ) {
      return;
    }


    if (
      !window.confirm(
        `Restaurar ${ficha.nome} como entidade ativa da campanha?`
      )
    ) {
      return;
    }


    const agora =
      Date.now();


    setFichas(
      anteriores =>
        anteriores.map(
          item => {
            if (
              item.id !==
              ficha.id
            ) {
              return item;
            }


            const ciclo =
              normalizarCicloEntidade(
                item.ciclo
              );


            return {
              ...item,

              ciclo: {
                ...ciclo,

                estado:
                  ESTADOS_CICLO_ENTIDADE.ATIVO,

                motivoEncerramento:
                  null,

                encerradoEm:
                  null,

                restauradoEm:
                  agora,

                historico: [
                  ...ciclo.historico,

                  {
                    tipo:
                      "restauracao",

                    em:
                      agora
                  }
                ]
              }
            };
          }
        )
    );
  }


  function excluirFicha(
    ficha
  ) {
    if (
      !campanhaAtual ||
      !ficha ||
      !podeExcluirEntidade(
        campanhaAtual,
        ficha
      )
    ) {
      return;
    }


    if (
      !window.confirm(
        `Excluir permanentemente ${ficha.nome}?\n\nEsta ação não poderá ser desfeita.`
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.filter(
          item =>
            item.id !==
            ficha.id
        )
    );


    if (
      fichaAberta ===
      ficha.id
    ) {
      setFichaAberta(null);
    }


    if (
      ultimaEntidadeId ===
      ficha.id
    ) {
      setUltimaEntidadeId(null);
    }
  }


  function alterarNovaFicha(
    campo,
    valor
  ) {
    setNovaFicha(
      anterior => {
        const nova = {
          ...anterior,
          [campo]:
            valor
        };


        const camposInformacao = [
          "idade",
          "altura",
          "peDominante",
          "raca",
          "nivel",
          "experiencia",
          "experienciaMax",
          "posicao"
        ];


        if (
          camposInformacao.includes(
            campo
          )
        ) {
          nova.informacoes = {
            ...(
              anterior.informacoes ||
              {}
            ),

            [campo]:
              valor
          };
        }


        return nova;
      }
    );
  }


  function alterarAtributoNovaFicha(
    nome,
    quantidade
  ) {
    setNovaFicha(
      anterior => ({
        ...anterior,

        atributos: {
          ...(
            anterior.atributos ||
            {}
          ),

          [nome]:
            Math.max(
              0,
              (
                Number(
                  anterior
                    .atributos
                    ?.[nome]
                ) ||
                0
              ) +
              quantidade
            )
        }
      })
    );
  }


  function definirAtributoNovaFicha(
    nome,
    valor
  ) {
    const numero =
      Number(valor);


    if (
      Number.isNaN(
        numero
      )
    ) {
      return;
    }


    setNovaFicha(
      anterior => ({
        ...anterior,

        atributos: {
          ...(
            anterior.atributos ||
            {}
          ),

          [nome]:
            Math.max(
              0,
              numero
            )
        }
      })
    );
  }


  function alterarRecursoNovaFicha(
    chave,
    campo,
    valor
  ) {
    const numero =
      Math.max(
        0,
        numeroSeguro(
          valor,
          0
        )
      );


    setNovaFicha(
      anterior => {
        const recurso = {
          atual: 0,
          maximo: 0,

          ...(
            anterior
              .recursos
              ?.[chave] ||
            {}
          ),

          [campo]:
            numero
        };


        if (
          campo ===
            "maximo" &&
          recurso.atual >
          recurso.maximo
        ) {
          recurso.atual =
            recurso.maximo;
        }


        return {
          ...anterior,

          recursos: {
            ...(
              anterior.recursos ||
              {}
            ),

            [chave]:
              recurso
          },

          ...(chave ===
            "vida" &&
          campo ===
            "maximo"
            ? {
                vidaMax:
                  numero
              }
            : {}),

          ...(chave ===
            "tp" &&
          campo ===
            "maximo"
            ? {
                tpMax:
                  numero
              }
            : {})
        };
      }
    );
  }


  function podeCriarTipo(
    tipo
  ) {
    if (
      !campanhaAtual
    ) {
      return false;
    }


    if (
      tipo ===
      TIPOS_ENTIDADE.PERSONAGEM
    ) {
      return possuiPermissao(
        campanhaAtual,
        "criarPersonagens"
      );
    }


    const area =
      encontrarAreaPorTipo(
        tipo
      );


    return Boolean(
      area &&
      possuiPermissao(
        campanhaAtual,
        AREAS_ENTIDADES[
          area
        ].permissao
      )
    );
  }


  const tiposCriacaoPermitidos =
    Object.values(
      TIPOS_ENTIDADE
    ).filter(
      podeCriarTipo
    );


  const tiposEdicaoPermitidos =
    editandoFicha
      ? (
        eMestreAtual
          ? Object.values(
              TIPOS_ENTIDADE
            )
          : [
              tipoEntidadeEdicao
            ]
      )
      : tiposCriacaoPermitidos;


  function visibilidadePadraoTipo(
    tipo
  ) {
    return tipo ===
      TIPOS_ENTIDADE.PERSONAGEM
      ? VISIBILIDADES_ENTIDADE.CAMPANHA
      : VISIBILIDADES_ENTIDADE.MESTRE;
  }


  function abrirCriacaoEntidade(
    tipo =
      TIPOS_ENTIDADE.PERSONAGEM,
    areaOrigem = null
  ) {
    if (
      !podeCriarTipo(
        tipo
      )
    ) {
      return;
    }


    const area =
      areaOrigem &&
      AREAS_ENTIDADES[
        areaOrigem
      ]
        ? areaOrigem
        : encontrarAreaPorTipo(
            tipo
          );


    setNovaFicha(
      criarEstadoNovaFicha(
        visibilidadePadraoTipo(
          tipo
        )
      )
    );


    setTipoEntidadeEdicao(
      tipo
    );


    setFichaAberta(null);
    setEditandoFicha(false);


    if (area) {
      setAreaEntidadesAtiva(
        area
      );

      setOrigemFicha(
        area
      );

    } else {
      setAreaEntidadesAtiva(
        null
      );

      setOrigemFicha(
        ORIGENS_FICHA.DASHBOARD
      );
    }


    setAreaCampanhaAtiva(
      null
    );


    setCriandoFicha(
      true
    );
  }


  function abrirCriacao() {
    abrirCriacaoEntidade(
      TIPOS_ENTIDADE.PERSONAGEM,
      null
    );
  }


  function alterarTipoFormulario(
    novoTipo
  ) {
    if (
      editandoFicha &&
      !eMestreAtual
    ) {
      return;
    }


    if (
      !editandoFicha &&
      !podeCriarTipo(
        novoTipo
      )
    ) {
      return;
    }


    setTipoEntidadeEdicao(
      novoTipo
    );


    if (
      !editandoFicha
    ) {
      setNovaFicha(
        anterior => ({
          ...anterior,

          visibilidade:
            visibilidadePadraoTipo(
              novoTipo
            )
        })
      );
    }
  }


  function criarFicha() {
    if (
      !idCampanhaAtual
    ) {
      return;
    }


    const nome =
      String(
        novaFicha.nome ||
        ""
      ).trim();


    if (!nome) {
      alert(
        "Digite um nome para a entidade."
      );

      return;
    }


    const informacoes = {
      ...criarInformacoesIniciais(),

      ...(
        novaFicha.informacoes ||
        {}
      ),

      idade:
        Math.max(
          0,
          numeroSeguro(
            novaFicha.idade,
            0
          )
        ),

      altura:
        novaFicha.altura ??
        "",

      peDominante:
        novaFicha.peDominante ||
        "",

      raca:
        novaFicha.raca ||
        "",

      nivel:
        normalizarNivel(
          novaFicha.nivel
        ),

      experiencia:
        Math.max(
          0,
          numeroSeguro(
            novaFicha.experiencia,
            0
          )
        ),

      experienciaMax:
        Math.max(
          1,
          numeroSeguro(
            novaFicha.experienciaMax,
            100
          )
        ),

      posicao:
        novaFicha.posicao ||
        ""
    };


    const recursos = {};


    Object.entries(
      {
        ...criarRecursosIniciais(),

        ...(
          novaFicha.recursos ||
          {}
        )
      }
    ).forEach(
      ([
        chave,
        recurso
      ]) => {
        if (
          chave ===
          "resistencia"
        ) {
          return;
        }


        const maximo =
          Math.max(
            0,
            numeroSeguro(
              recurso?.maximo,
              0
            )
          );


        recursos[chave] = {
          ...recurso,

          maximo,

          atual:
            Math.min(
              maximo,
              Math.max(
                0,
                numeroSeguro(
                  recurso?.atual,
                  maximo
                )
              )
            )
        };
      }
    );


    const arquetipoInicial =
      typeof novaFicha
        ?.arquetipoId ===
      "string"
        ? novaFicha.arquetipoId
        : null;


    const criada =
      normalizarFicha(
        {
          ...fichaModelo,

          id:
            Date.now(),

          nome,

          imagem:
            novaFicha.imagem ||
            "",

          tipoEntidade:
            tipoEntidadeEdicao,

          proprietarioId:
            usuarioAtualId,

          visibilidade:
            novaFicha.visibilidade ||
            visibilidadePadraoTipo(
              tipoEntidadeEdicao
            ),

          participantesPermitidos:
            [],

          ciclo:
            criarCicloEntidadeInicial(),

          informacoes,

          recursos,

          momentum:
            Math.max(
              0,
              numeroSeguro(
                novaFicha.momentum,
                criarMomentumInicial()
                  .atual
              )
            ),

          momentumMax:
            Math.max(
              0,
              numeroSeguro(
                novaFicha.momentumMax,
                criarMomentumInicial()
                  .maximo
              )
            ),

          estados: {
            ...criarEstadosIniciais(),

            ...(
              novaFicha.estados ||
              {}
            )
          },

          atributos:
            normalizarAtributos(
              novaFicha.atributos
            ),

          arquetipoId:
            arquetipoInicial,

          arquetiposAdquiridos:
            arquetipoInicial
              ? [
                  {
                    id:
                      arquetipoInicial,

                    adquiridoEmNivel:
                      informacoes.nivel,

                    adquiridoEm:
                      Date.now()
                  }
                ]
              : [],

          talentosPosicionais:
            Array.isArray(
              novaFicha
                .talentosPosicionais
            )
              ? [
                  ...novaFicha
                    .talentosPosicionais
                ]
              : [],

          habilidades:
            []
        },

        idCampanhaAtual,
        usuarioAtualId
      );


    setFichas(
      anteriores => [
        ...anteriores,
        criada
      ]
    );


    setCriandoFicha(false);


    setUltimaEntidadeId(
      criada.id
    );


    setFichaAberta(
      criada.id
    );
  }


  function abrirEdicao(
    ficha
  ) {
    if (
      !campanhaAtual ||
      !ficha ||
      !podeEditarEntidade(
        campanhaAtual,
        ficha
      )
    ) {
      return;
    }


    const normalizada =
      normalizarFicha(
        ficha,
        idCampanhaAtual,
        ficha.proprietarioId
      );


    setTipoEntidadeEdicao(
      normalizada.tipoEntidade
    );


    setNovaFicha({
      nome:
        normalizada.nome,

      imagem:
        normalizada.imagem ||
        "",

      visibilidade:
        normalizada.visibilidade,

      idade:
        normalizada.idade,

      altura:
        normalizada.altura,

      peDominante:
        normalizada.peDominante,

      raca:
        normalizada.raca,

      nivel:
        normalizada.nivel,

      experiencia:
        normalizada.experiencia,

      experienciaMax:
        normalizada.experienciaMax,

      posicao:
        normalizada.posicao,

      vidaMax:
        normalizada.vidaMax,

      tpMax:
        normalizada.tpMax,

      momentum:
        normalizada.momentum,

      momentumMax:
        normalizada.momentumMax,

      arquetipoId:
        normalizada.arquetipoId,

      arquetiposAdquiridos:
        normalizada
          .arquetiposAdquiridos
          .map(
            registro => ({
              ...registro
            })
          ),

      talentosPosicionais:
        normalizada
          .talentosPosicionais
          .map(
            talento =>
              typeof talento ===
              "object"
                ? {
                    ...talento
                  }
                : talento
          ),

      informacoes: {
        ...normalizada.informacoes
      },

      recursos:
        JSON.parse(
          JSON.stringify(
            normalizada.recursos
          )
        ),

      estados: {
        ...normalizada.estados
      },

      atributos: {
        ...normalizada.atributos
      }
    });


    setEditandoFicha(
      true
    );

    setCriandoFicha(
      false
    );
  }


  function salvarEdicao() {
    if (
      !fichaAtual ||
      !campanhaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    const nome =
      String(
        novaFicha.nome ||
        ""
      ).trim();


    if (!nome) {
      alert(
        "Digite um nome para a entidade."
      );

      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const atual =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const informacoes = {
              ...atual.informacoes,

              ...(
                novaFicha.informacoes ||
                {}
              ),

              idade:
                Math.max(
                  0,
                  numeroSeguro(
                    novaFicha.idade,
                    atual.idade
                  )
                ),

              altura:
                novaFicha.altura ??
                "",

              peDominante:
                novaFicha.peDominante ||
                "",

              raca:
                novaFicha.raca ||
                "",

              nivel:
                normalizarNivel(
                  novaFicha.nivel
                ),

              experiencia:
                Math.max(
                  0,
                  numeroSeguro(
                    novaFicha.experiencia,
                    atual.experiencia
                  )
                ),

              experienciaMax:
                Math.max(
                  1,
                  numeroSeguro(
                    novaFicha.experienciaMax,
                    atual.experienciaMax
                  )
                ),

              posicao:
                novaFicha.posicao ||
                ""
            };


            const recursos = {};


            Object.entries(
              {
                ...atual.recursos,

                ...(
                  novaFicha.recursos ||
                  {}
                )
              }
            ).forEach(
              ([
                chave,
                recurso
              ]) => {
                if (
                  chave ===
                  "resistencia"
                ) {
                  return;
                }


                const maximo =
                  Math.max(
                    0,
                    numeroSeguro(
                      recurso?.maximo,
                      0
                    )
                  );


                recursos[chave] = {
                  ...recurso,

                  maximo,

                  atual:
                    Math.min(
                      maximo,
                      Math.max(
                        0,
                        numeroSeguro(
                          recurso?.atual,
                          0
                        )
                      )
                    )
                };
              }
            );


            return normalizarFicha(
              {
                ...atual,

                nome,

                imagem:
                  novaFicha.imagem ||
                  "",

                tipoEntidade:
                  eMestreAtual
                    ? tipoEntidadeEdicao
                    : atual.tipoEntidade,

                visibilidade:
                  novaFicha.visibilidade ||
                  atual.visibilidade,

                informacoes,

                recursos,

                momentum:
                  atual.momentum,

                momentumMax:
                  atual.momentumMax,

                estados: {
                  ...atual.estados,

                  ...(
                    novaFicha.estados ||
                    {}
                  )
                },

                atributos:
                  normalizarAtributos(
                    novaFicha.atributos
                  ),

                arquetipoId:
                  atual.arquetipoId,

                arquetiposAdquiridos:
                  atual.arquetiposAdquiridos,

                talentosPosicionais:
                  atual.talentosPosicionais,

                evolucao:
                  informacoes.nivel !== atual.informacoes?.nivel
                    ? [
                        ...(atual.evolucao || []),
                        {
                          id: `evolucao-${crypto.randomUUID()}`,
                          tipo: "nível",
                          titulo: "Alteração de nível",
                          antes: atual.informacoes?.nivel,
                          depois: informacoes.nivel,
                          origem: "edicao-ficha",
                          data: new Date().toISOString().slice(0, 10),
                          criadoEm: Date.now()
                        }
                      ]
                    : atual.evolucao
              },

              idCampanhaAtual,
              atual.proprietarioId
            );
          }
        )
    );


    if (
      AREAS_ENTIDADES[
        origemFicha
      ]
    ) {
      const novaArea =
        encontrarAreaPorTipo(
          tipoEntidadeEdicao
        );


      if (novaArea) {
        setOrigemFicha(
          novaArea
        );

        setAreaEntidadesAtiva(
          novaArea
        );

      } else {
        setOrigemFicha(
          ORIGENS_FICHA.DASHBOARD
        );

        setAreaEntidadesAtiva(
          null
        );
      }
    }


    setEditandoFicha(
      false
    );
  }


  function processarImagem(
    arquivo,
    callback
  ) {
    if (
      !arquivo ||
      !arquivo.type.startsWith(
        "image/"
      )
    ) {
      return;
    }


    const leitor =
      new FileReader();


    leitor.onload =
      evento => {
        const imagem =
          new Image();


        imagem.onload =
          () => {
            const max =
              512;


            const proporcao =
              Math.min(
                1,
                max / imagem.width,
                max / imagem.height
              );


            const canvas =
              document.createElement(
                "canvas"
              );


            canvas.width =
              Math.round(
                imagem.width *
                proporcao
              );


            canvas.height =
              Math.round(
                imagem.height *
                proporcao
              );


            const ctx =
              canvas.getContext(
                "2d"
              );


            ctx?.drawImage(
              imagem,
              0,
              0,
              canvas.width,
              canvas.height
            );


            callback(
              canvas.toDataURL(
                "image/jpeg",
                0.72
              )
            );
          };


        imagem.src =
          evento.target.result;
      };


    leitor.readAsDataURL(
      arquivo
    );
  }


  function selecionarAvatar(
    evento
  ) {
    const arquivo =
      evento.target.files?.[0];


    if (!arquivo) {
      return;
    }


    processarImagem(
      arquivo,
      imagem =>
        setNovaFicha(
          anterior => ({
            ...anterior,
            imagem
          })
        )
    );


    evento.target.value =
      "";
  }


  function alterarRecurso(
    chave,
    campoAntigo,
    campoMaximoAntigo,
    quantidade
  ) {
    if (
      !fichaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const normalizada =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const recurso =
              normalizada
                .recursos[chave];


            if (!recurso) {
              return ficha;
            }


            const novo =
              Math.max(
                0,
                Math.min(
                  recurso.maximo,
                  recurso.atual +
                    quantidade
                )
              );


            const legado = {};


            if (
              campoAntigo
            ) {
              legado[
                campoAntigo
              ] = novo;
            }


            if (
              campoMaximoAntigo
            ) {
              legado[
                campoMaximoAntigo
              ] = recurso.maximo;
            }


            return {
              ...normalizada,
              ...legado,

              recursos: {
                ...normalizada.recursos,

                [chave]: {
                  ...recurso,
                  atual:
                    novo
                }
              }
            };
          }
        )
    );
  }


  function definirMaximoRecurso(
    chave,
    valor
  ) {
    const numero =
      Math.max(
        0,
        numeroSeguro(
          valor,
          0
        )
      );


    if (
      !fichaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const normalizada =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const recurso =
              normalizada
                .recursos[chave];


            if (!recurso) {
              return ficha;
            }


            const atual =
              Math.min(
                recurso.atual,
                numero
              );


            const legado = {};


            if (
              chave ===
              "vida"
            ) {
              legado.vida =
                atual;

              legado.vidaMax =
                numero;
            }


            if (
              chave ===
              "tp"
            ) {
              legado.tp =
                atual;

              legado.tpMax =
                numero;
            }


            return {
              ...normalizada,
              ...legado,

              recursos: {
                ...normalizada.recursos,

                [chave]: {
                  ...recurso,

                  atual,

                  maximo:
                    numero
                }
              }
            };
          }
        )
    );
  }


  function alterarVida(
    quantidade
  ) {
    alterarRecurso(
      "vida",
      "vida",
      "vidaMax",
      quantidade
    );
  }


  function alterarGP(
    quantidade
  ) {
    alterarRecurso(
      "gp",
      null,
      null,
      quantidade
    );
  }


  function alterarTP(
    quantidade
  ) {
    alterarRecurso(
      "tp",
      "tp",
      "tpMax",
      quantidade
    );
  }


  function alterarRitmoIndividual(
    quantidade
  ) {
    alterarRecurso(
      "ritmoIndividual",
      null,
      null,
      quantidade
    );
  }


  function alterarRitmoEquipe(
    quantidade
  ) {
    alterarRecurso(
      "ritmoEquipe",
      null,
      null,
      quantidade
    );
  }


  function alterarMomentum(
    quantidade
  ) {
    if (
      !fichaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const normalizada =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const atual =
              Math.max(
                0,
                numeroSeguro(
                  normalizada.momentum,
                  0
                )
              );


            const maximo =
              Math.max(
                0,
                numeroSeguro(
                  normalizada.momentumMax,
                  0
                )
              );


            let novo =
              Math.max(
                0,
                atual +
                  quantidade
              );


            if (
              maximo >
              0
            ) {
              novo =
                Math.min(
                  maximo,
                  novo
                );
            }


            return {
              ...normalizada,

              momentum:
                novo
            };
          }
        )
    );
  }


  function definirMomentum(
    valor
  ) {
    const numero =
      Number(valor);


    if (
      Number.isNaN(
        numero
      ) ||
      !fichaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const normalizada =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const maximo =
              Math.max(
                0,
                numeroSeguro(
                  normalizada.momentumMax,
                  0
                )
              );


            let novo =
              Math.max(
                0,
                numero
              );


            if (
              maximo >
              0
            ) {
              novo =
                Math.min(
                  maximo,
                  novo
                );
            }


            return {
              ...normalizada,

              momentum:
                novo
            };
          }
        )
    );
  }


  function definirEstado(
    chave,
    valor
  ) {
    if (
      ![
        "fisico",
        "mental"
      ].includes(
        chave
      ) ||
      !fichaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    const texto =
      String(
        valor ??
        ""
      );


    setFichas(
      anteriores =>
        anteriores.map(
          ficha =>
            ficha.id !==
            fichaAtual.id
              ? ficha
              : {
                  ...ficha,

                  estados: {
                    ...(
                      ficha.estados ||
                      {}
                    ),

                    [chave]:
                      texto
                  }
                }
        )
    );
  }


  function alterarAtributo(
    nome,
    quantidade
  ) {
    if (
      !fichaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (ficha.id !== fichaAtual.id) return ficha;
            const antes = Number(ficha.atributos?.[nome]) || 0;
            const depois = Math.max(0, antes + quantidade);
            if (antes === depois) return ficha;
            return {
              ...ficha,
              atributos: { ...(ficha.atributos || {}), [nome]: depois },
              evolucao: [...(ficha.evolucao || []), {
                id: `evolucao-${crypto.randomUUID()}`,
                tipo: "atributo",
                titulo: nome,
                antes,
                depois,
                origem: "atributos",
                data: new Date().toISOString().slice(0, 10),
                criadoEm: Date.now()
              }]
            };
          }
        )
    );
  }


  function definirAtributo(
    nome,
    valor
  ) {
    const numero =
      Number(valor);


    if (
      Number.isNaN(
        numero
      ) ||
      !fichaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (ficha.id !== fichaAtual.id) return ficha;
            const antes = Number(ficha.atributos?.[nome]) || 0;
            const depois = Math.max(0, numero);
            if (antes === depois) return ficha;
            return {
              ...ficha,
              atributos: { ...(ficha.atributos || {}), [nome]: depois },
              evolucao: [...(ficha.evolucao || []), {
                id: `evolucao-${crypto.randomUUID()}`,
                tipo: "atributo",
                titulo: nome,
                antes,
                depois,
                origem: "atributos",
                data: new Date().toISOString().slice(0, 10),
                criadoEm: Date.now()
              }]
            };
          }
        )
    );
  }


  function adquirirArquetipo(
    arquetipoId
  ) {
    const id =
      String(
        arquetipoId ||
        ""
      ).trim();


    if (
      !id ||
      !fichaAtual ||
      !campanhaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const normalizada =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const adquiridos =
              normalizada
                .arquetiposAdquiridos ||
              [];


            if (
              adquiridos.some(
                registro =>
                  registro.id ===
                  id
              )
            ) {
              return normalizada;
            }


            const nivel =
              normalizada
                ?.informacoes
                ?.nivel ??
              normalizada.nivel ??
              null;


            return {
              ...normalizada,

              arquetipoId:
                normalizada
                  .arquetipoId ||
                id,

              arquetiposAdquiridos: [
                ...adquiridos,

                {
                  id,

                  adquiridoEmNivel:
                    nivel,

                  adquiridoEm:
                    Date.now()
                }
              ]
            };
          }
        )
    );
  }


  function definirArquetipoDestaque(
    arquetipoId
  ) {
    const id =
      String(
        arquetipoId ||
        ""
      ).trim();


    if (
      !id ||
      !fichaAtual ||
      !campanhaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const normalizada =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const possui =
              normalizada
                .arquetiposAdquiridos
                .some(
                  registro =>
                    registro.id ===
                    id
                );


            if (!possui) {
              return normalizada;
            }


            return {
              ...normalizada,

              arquetipoId:
                id
            };
          }
        )
    );
  }


  function removerArquetipo(
    arquetipoId
  ) {
    const id =
      String(
        arquetipoId ||
        ""
      ).trim();


    if (
      !id ||
      !fichaAtual ||
      !campanhaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    if (
      !window.confirm(
        "Remover este Arquétipo do personagem?"
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const normalizada =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const restantes =
              normalizada
                .arquetiposAdquiridos
                .filter(
                  registro =>
                    registro.id !==
                    id
                );


            const novoDestaque =
              normalizada
                .arquetipoId ===
              id
                ? (
                  restantes[
                    0
                  ]?.id ||
                  null
                )
                : normalizada
                    .arquetipoId;


            return {
              ...normalizada,

              arquetipoId:
                novoDestaque,

              arquetiposAdquiridos:
                restantes
            };
          }
        )
    );
  }


  function adquirirTalentoPosicional(
    talentoId
  ) {
    const id =
      String(
        talentoId ||
        ""
      ).trim();


    if (
      !id ||
      !fichaAtual ||
      !campanhaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const normalizada =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const talentos =
              normalizada
                .talentosPosicionais ||
              [];


            const possui =
              talentos.some(
                talento =>
                  obterIdTalento(
                    talento
                  ) ===
                  id
              );


            if (possui) {
              return normalizada;
            }


            const nivel =
              normalizada
                ?.informacoes
                ?.nivel ??
              normalizada.nivel ??
              null;


            return {
              ...normalizada,

              talentosPosicionais: [
                ...talentos,

                {
                  id,

                  grau:
                    1,

                  observacaoEvolucao:
                    "",

                  adquiridoEmNivel:
                    nivel,

                  adquiridoEm:
                    Date.now()
                }
              ]
            };
          }
        )
    );
  }


  function removerTalentoPosicional(
    talentoId
  ) {
    const id =
      String(
        talentoId ||
        ""
      ).trim();


    if (
      !id ||
      !fichaAtual ||
      !campanhaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    if (
      !window.confirm(
        "Remover este Talento Posicional do personagem?"
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const normalizada =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const restantes =
              (
                normalizada
                  .talentosPosicionais ||
                []
              ).filter(
                talento =>
                  obterIdTalento(
                    talento
                  ) !==
                  id
              );


            return {
              ...normalizada,

              talentosPosicionais:
                restantes
            };
          }
        )
    );
  }


  function atualizarTalentoPosicional(
    talentoId,
    alteracoes
  ) {
    const id =
      String(
        talentoId ||
        ""
      ).trim();


    if (
      !id ||
      !fichaAtual ||
      !campanhaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    const mudancas =
      alteracoes &&
      typeof alteracoes ===
      "object"
        ? alteracoes
        : {};


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const normalizada =
              normalizarFicha(
                ficha,
                idCampanhaAtual,
                ficha.proprietarioId
              );


            const talentos =
              normalizada
                .talentosPosicionais ||
              [];


            let encontrado =
              false;


            const atualizados =
              talentos.map(
                talento => {
                  const talentoIdAtual =
                    obterIdTalento(
                      talento
                    );


                  if (
                    talentoIdAtual !==
                    id
                  ) {
                    return talento;
                  }


                  encontrado =
                    true;


                  const base =
                    typeof talento ===
                    "object"
                      ? {
                          ...talento
                        }
                      : {
                          id:
                            talentoIdAtual,

                          grau:
                            1,

                          observacaoEvolucao:
                            ""
                        };


                  const atualizado = {
                    ...base,

                    id
                  };


                  if (
                    Object.prototype
                      .hasOwnProperty
                      .call(
                        mudancas,
                        "grau"
                      )
                  ) {
                    atualizado.grau =
                      normalizarGrauTalento(
                        mudancas.grau
                      );
                  }


                  if (
                    Object.prototype
                      .hasOwnProperty
                      .call(
                        mudancas,
                        "observacaoEvolucao"
                      )
                  ) {
                    atualizado.observacaoEvolucao =
                      String(
                        mudancas
                          .observacaoEvolucao ??
                        ""
                      );
                  }


                  atualizado.atualizadoEm =
                    Date.now();


                  return atualizado;
                }
              );


            if (!encontrado) {
              return normalizada;
            }


            return {
              ...normalizada,

              talentosPosicionais:
                atualizados
            };
          }
        )
    );
  }


  function criarHabilidade(
    habilidade
  ) {
    if (
      !fichaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha =>
            ficha.id !==
            fichaAtual.id
              ? ficha
              : {
                  ...ficha,

                  habilidades: [
                    ...(
                      ficha.habilidades ||
                      []
                    ),

                    {
                      id:
                        Date.now(),

                      ...habilidade
                    }
                  ],

                  evolucao: [
                    ...(ficha.evolucao || []),
                    {
                      id: `evolucao-${crypto.randomUUID()}`,
                      tipo: "Hissatsu",
                      titulo: `Hissatsu adquirida: ${habilidade.nome || "Nova técnica"}`,
                      depois: habilidade.nome || "Nova técnica",
                      origem: "habilidades",
                      data: new Date().toISOString().slice(0, 10),
                      criadoEm: Date.now()
                    }
                  ]
                }
        )
    );
  }


  function editarHabilidade(
    indice,
    dados
  ) {
    if (
      !fichaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha => {
            if (
              ficha.id !==
              fichaAtual.id
            ) {
              return ficha;
            }


            const habilidades = [
              ...(
                ficha.habilidades ||
                []
              )
            ];


            if (
              !habilidades[indice]
            ) {
              return ficha;
            }


            habilidades[indice] = {
              ...habilidades[indice],
              ...dados
            };


            return {
              ...ficha,
              habilidades
            };
          }
        )
    );
  }


  function excluirHabilidade(
    indice
  ) {
    if (
      !fichaAtual ||
      !podeEditarEntidade(
        campanhaAtual,
        fichaAtual
      )
    ) {
      return;
    }


    const habilidade =
      fichaAtual
        .habilidades
        ?.[indice];


    if (
      !habilidade ||
      !window.confirm(
        `Excluir ${habilidade.nome}?`
      )
    ) {
      return;
    }


    setFichas(
      anteriores =>
        anteriores.map(
          ficha =>
            ficha.id !==
            fichaAtual.id
              ? ficha
              : {
                  ...ficha,

                  habilidades:
                    (
                      ficha.habilidades ||
                      []
                    ).filter(
                      (_, i) =>
                        i !==
                        indice
                    )
                }
        )
    );
  }


  function calcularPorcentagem(
    valor,
    maximo
  ) {
    const atual =
      numeroSeguro(
        valor,
        0
      );


    const total =
      numeroSeguro(
        maximo,
        0
      );


    return total <=
      0
      ? 0
      : Math.min(
          100,
          Math.max(
            0,
            (
              atual /
              total
            ) *
            100
          )
        );
  }


  function criarAnotacao() {
    const agora =
      Date.now();


    const nova =
      normalizarAnotacao(
        {
          id:
            `nota-${agora}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,

          titulo:
            "Nova anotação",

          texto:
            "",

          proprietarioId:
            usuarioAtualId,

          visibilidade:
            eMestreAtual
              ? VISIBILIDADES_ENTIDADE.MESTRE
              : VISIBILIDADES_ENTIDADE.PROPRIETARIO,

          fixada:
            false,

          criadaEm:
            agora,

          atualizadaEm:
            agora
        },

        usuarioAtualId
      );


    setCampanhas(
      anteriores =>
        anteriores.map(
          campanha =>
            campanha.id ===
            idCampanhaAtual
              ? {
                  ...campanha,

                  anotacoes: [
                    ...(
                      campanha.anotacoes ||
                      []
                    ),

                    nova
                  ],

                  atualizadaEm:
                    agora
                }
              : campanha
        )
    );


    return nova;
  }


  function atualizarAnotacao(
    anotacaoId,
    alteracoes
  ) {
    const agora =
      Date.now();


    setCampanhas(
      anteriores =>
        anteriores.map(
          campanha => {
            if (
              campanha.id !==
              idCampanhaAtual
            ) {
              return campanha;
            }


            return {
              ...campanha,

              anotacoes:
                (
                  campanha.anotacoes ||
                  []
                ).map(
                  anotacao =>
                    anotacao.id ===
                    anotacaoId
                      ? {
                          ...anotacao,
                          ...alteracoes,

                          atualizadaEm:
                            agora
                        }
                      : anotacao
                ),

              atualizadaEm:
                agora
            };
          }
        )
    );
  }


  function excluirAnotacao(
    anotacaoId
  ) {
    setCampanhas(
      anteriores =>
        anteriores.map(
          campanha =>
            campanha.id ===
            idCampanhaAtual
              ? {
                  ...campanha,

                  anotacoes:
                    (
                      campanha.anotacoes ||
                      []
                    ).filter(
                      anotacao =>
                        anotacao.id !==
                        anotacaoId
                    ),

                  atualizadaEm:
                    Date.now()
                }
              : campanha
        )
    );
  }


  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        let remotas =
          await carregarCampanhasRemotas(
            usuario.id
          );

        const possuiDadosLocais = Boolean(
          localStorage.getItem(CHAVE_CAMPANHAS)
        );

        if (remotas.length === 0 && possuiDadosLocais) {
          remotas =
            prepararCampanhasLocais(
              carregarCampanhas(),
              usuario
            );

          await salvarCampanhasRemotas(
            remotas,
            usuario.id
          );

          await migrarBancosHissatsuLocais(
            remotas.map(campanha => campanha.id)
          );
        }


        await hidratarBancosHissatsu(
          remotas.map(campanha => campanha.id)
        );

        if (ativo) {
          setCampanhas(
            remotas.map(
              normalizarCampanha
            )
          );
          setCampanhaAtivaId(
            remotas[0]?.id || null
          );
          setErroPersistencia("");
          setDadosRemotosCarregados(true);
        }
      } catch (erro) {
        console.error("Erro ao carregar dados do Supabase:", erro);
        if (ativo) {
          const schemaAusente = erro?.code === "PGRST205" || /Could not find the table/i.test(erro?.message || "");
          setErroPersistencia(
            schemaAusente
              ? "O banco do RPG Manager ainda não foi criado neste Supabase. Execute supabase/schema.sql no SQL Editor."
              : "Não foi possível carregar seus dados. Confira o schema e a conexão do Supabase."
          );
          setDadosRemotosCarregados(true);
        }
      }
    }

    carregar();
    return () => { ativo = false; };
  }, [usuario]);


  useEffect(() => {
    if (
      !dadosRemotosCarregados ||
      campanhas.length === 0
    ) {
      return undefined;
    }

    const temporizador = window.setTimeout(
      async () => {
        try {
          await salvarCampanhasRemotas(
            campanhas,
            usuario.id
          );
          setErroPersistencia("");
        } catch (erro) {
          console.error("Erro ao salvar dados no Supabase:", erro);
          setErroPersistencia("Algumas alterações ainda não foram sincronizadas.");
        }
      },
      500
    );

    return () => window.clearTimeout(temporizador);
  }, [campanhas, dadosRemotosCarregados, usuario.id]);


  useEffect(() => {
    if (
      !campanhaAtual
    ) {
      return;
    }


    const fichaExiste =
      fichaAberta !==
        null &&
      fichaAtual !==
        null;


    const navegacao = {
      campanhaAtivaId:
        campanhaAtual.id,

      entidadeAtivaId:
        fichaExiste
          ? fichaAberta
          : null,

      tela:
        fichaExiste
          ? "ficha"
          : "campanha",

      origemFicha,

      areaEntidadesAtiva,

      areaCampanhaAtiva,

      arquivo:
        estadoArquivo,

      ultimaAtividade:
        Date.now()
    };


    sessionStorage.setItem(
      CHAVE_SESSAO_NAVEGACAO,
      JSON.stringify(
        navegacao
      )
    );
  }, [
    campanhaAtual,
    fichaAberta,
    fichaAtual,
    origemFicha,
    areaEntidadesAtiva,
    areaCampanhaAtiva,
    estadoArquivo
  ]);


  useEffect(() => {
    if (
      !campanhaAtual
    ) {
      return;
    }


    localStorage.setItem(
      CHAVE_NAVEGACAO,
      JSON.stringify({
        campanhaAtivaId:
          campanhaAtual.id,

        entidadeAtivaId:
          ultimaEntidadeId,

        tela:
          "campanha",

        ultimaAtividade:
          Date.now()
      })
    );
  }, [
    campanhaAtual,
    ultimaEntidadeId
  ]);


  useEffect(() => {
    if (
      campanhaAtual &&
      campanhaAtivaId !==
      campanhaAtual.id
    ) {
      setCampanhaAtivaId(
        campanhaAtual.id
      );
    }
  }, [
    campanhaAtual,
    campanhaAtivaId
  ]);


  function salvarModuloCampanha(campo, valor) {
    if (!idCampanhaAtual || !possuiPermissao(campanhaAtual, "editarConfiguracao")) return;
    setCampanhas(anteriores => anteriores.map(campanha =>
      campanha.id === idCampanhaAtual
        ? { ...campanha, [campo]: valor, atualizadaEm: Date.now() }
        : campanha
    ));
  }

  const fichasVisiveis = fichas.filter(ficha => !entidadeEstaArquivada(ficha) && podeAcessarFicha(ficha));
  const personagens = fichasVisiveis.filter(ficha => ficha.tipoEntidade === TIPOS_ENTIDADE.PERSONAGEM);
  const podeConfigurar = possuiPermissao(campanhaAtual, "administrarCampanha");
  const podeCriarFicha = possuiPermissao(campanhaAtual, "criarPersonagens");
  const diretorioAberto = ["personagens", "fichas", "habilidades", "inventario"].includes(telaPainel);

  function navegarPainel(destino) {
    setFichaAberta(null);
    setCriandoFicha(false);
    setEditandoFicha(false);
    setAreaEntidadesAtiva(null);
    setAreaCampanhaAtiva(null);
    setOrigemFicha(ORIGENS_FICHA.DASHBOARD);
    setEstadoArquivo(criarEstadoArquivoInicial());

    if (AREAS_CAMPANHA.has(destino)) {
      if (!campanhaAtual || (destino === "configuracoes" && !podeConfigurar)) return;
      setAreaCampanhaAtiva(destino);
      return;
    }
    setTelaPainel(destino);
  }

  function selecionarCampanha(id) {
    setCampanhaAtivaId(id);
    navegarPainel("inicio");
  }

  async function atualizarCampanhas(operacao) {
    const anteriores = new Set(campanhas.map(campanha => campanha.id));
    const remotas = await operacao;
    setCampanhas(remotas.map(normalizarCampanha));
    const destino = remotas.find(campanha => !anteriores.has(campanha.id))
      || remotas.find(campanha => campanha.id === idCampanhaAtual)
      || remotas[0];
    if (destino) selecionarCampanha(destino.id);
  }

  function criarPrimeiraCampanha(nome) {
    return atualizarCampanhas(criarCampanhaRemota(nome, usuario.id));
  }

  function entrarPrimeiraCampanha(codigo) {
    return atualizarCampanhas(entrarEmCampanhaPorCodigo(codigo, usuario.id));
  }

  function renderizarPagina() {
    if (!dadosRemotosCarregados) {
      return <ManagerLoading>Carregando suas campanhas…</ManagerLoading>;
    }

    if (erroPersistencia && campanhas.length === 0) {
      return <main className="auth-shell"><section className="auth-card"><h1>RPG Manager</h1><p>{erroPersistencia}</p><button type="button" onClick={() => window.location.reload()}>Tentar novamente</button></section></main>;
    }

    if (campanhas.length === 0) {
      const nome = usuario.user_metadata?.username || "aventureiro";
      return <PrimeiroAcesso nome={nome} onCriar={criarPrimeiraCampanha} onEntrar={entrarPrimeiraCampanha} />;
    }

    if (telaPainel === "campanhas") {
      return <MinhasCampanhas campanhas={campanhas} atualId={idCampanhaAtual} onEntrar={selecionarCampanha} onCriar={criarPrimeiraCampanha} onConvidado={entrarPrimeiraCampanha} />;
    }

    if (
      criandoFicha
    ) {
      return (
        <CriadorEntidade
          modo="criar"

          configuracao={
            configuracaoCampanha
          }

          novaFicha={
            novaFicha
          }

          tipoEntidade={
            tipoEntidadeEdicao
          }

          tiposPermitidos={
            tiposCriacaoPermitidos
          }

          podeAlterarTipo

          nomeProprietario={
            obterNomeParticipante(
              usuarioAtualId
            )
          }

          alterarCampo={
            alterarNovaFicha
          }

          alterarAtributo={
            alterarAtributoNovaFicha
          }

          definirAtributo={
            definirAtributoNovaFicha
          }

          alterarRecurso={
            alterarRecursoNovaFicha
          }

          onAlterarTipo={
            alterarTipoFormulario
          }

          inputFotoRef={
            inputFotoRef
          }

          selecionarAvatar={
            selecionarAvatar
          }

          abrirSeletorDeFoto={() =>
            inputFotoRef
              .current
              ?.click()
          }

          removerAvatar={() =>
            setNovaFicha(
              anterior => ({
                ...anterior,
                imagem: ""
              })
            )
          }

          usarImagemPorUrl={
            url =>
              setNovaFicha(
                anterior => ({
                  ...anterior,
                  imagem: url
                })
              )
          }

          onCriar={
            criarFicha
          }

          onVoltar={() =>
            setCriandoFicha(
              false
            )
          }
        />
      );
    }


    if (
      editandoFicha &&
      fichaAtual
    ) {
      return (
        <CriadorEntidade
          modo="editar"

          configuracao={
            configuracaoCampanha
          }

          novaFicha={
            novaFicha
          }

          tipoEntidade={
            tipoEntidadeEdicao
          }

          tiposPermitidos={
            tiposEdicaoPermitidos
          }

          podeAlterarTipo={
            eMestreAtual
          }

          nomeProprietario={
            obterNomeParticipante(
              fichaAtual.proprietarioId
            )
          }

          alterarCampo={
            alterarNovaFicha
          }

          alterarAtributo={
            alterarAtributoNovaFicha
          }

          definirAtributo={
            definirAtributoNovaFicha
          }

          alterarRecurso={
            alterarRecursoNovaFicha
          }

          onAlterarTipo={
            alterarTipoFormulario
          }

          inputFotoRef={
            inputFotoRef
          }

          selecionarAvatar={
            selecionarAvatar
          }

          abrirSeletorDeFoto={() =>
            inputFotoRef
              .current
              ?.click()
          }

          removerAvatar={() =>
            setNovaFicha(
              anterior => ({
                ...anterior,
                imagem: ""
              })
            )
          }

          usarImagemPorUrl={
            url =>
              setNovaFicha(
                anterior => ({
                  ...anterior,
                  imagem: url
                })
              )
          }

          onSalvar={
            salvarEdicao
          }

          onVoltar={() =>
            setEditandoFicha(
              false
            )
          }
        />
      );
    }


    if (!fichaAtual && areaCampanhaAtiva === "configuracoes" && podeConfigurar) {
      return <ConfiguracoesCampanha campanha={campanhaAtual} participantes={campanhaAtual?.participantes || []}
        onAlterarPermissaoParticipante={alterarPermissaoParticipante} onConvidarParticipante={convidarJogador}
        onRemoverParticipante={removerJogador} onVoltar={() => setAreaCampanhaAtiva(null)} />;
    }

    if (!fichaAtual && areaCampanhaAtiva === "equipe") {
      return <EquipeCampanha campanha={campanhaAtual} entidades={fichas} podeEditar={possuiPermissao(campanhaAtual, "editarConfiguracao")} onSalvar={salvarModuloCampanha} onVoltar={() => setAreaCampanhaAtiva(null)} />;
    }


    if (!fichaAtual && areaCampanhaAtiva === "jornada") {
      return <JornadaCampanha campanha={campanhaAtual} entidades={fichas} podeEditar={possuiPermissao(campanhaAtual, "editarConfiguracao")} onSalvar={salvarModuloCampanha} onVoltar={() => setAreaCampanhaAtiva(null)} />;
    }


    if (!fichaAtual && areaCampanhaAtiva === "vinculos") {
      return <VinculosCampanha entidades={fichas} onAbrir={ficha => abrirFicha(ficha, ORIGENS_FICHA.VINCULOS)} onVoltar={() => setAreaCampanhaAtiva(null)} />;
    }


    if (
      !fichaAtual &&
      areaCampanhaAtiva ===
        AREA_ANOTACOES
    ) {
      return (
        <AnotacoesCampanha
          campanha={
            campanhaAtual
          }

          anotacoes={
            anotacoesVisiveis
          }

          participantes={
            campanhaAtual
              ?.participantes ||
            []
          }

          usuarioAtualId={
            usuarioAtualId
          }

          onVoltar={() =>
            setAreaCampanhaAtiva(
              null
            )
          }

          onCriarAnotacao={
            criarAnotacao
          }

          onAtualizarAnotacao={
            atualizarAnotacao
          }

          onExcluirAnotacao={
            excluirAnotacao
          }
        />
      );
    }


    if (
      !fichaAtual &&
      areaEntidadesAtiva
    ) {
      return (
        <AreaEntidades
          area={
            areaEntidadesAtiva
          }

          campanha={
            campanhaAtual
          }

          entidades={
            fichas
          }

          participantes={
            campanhaAtual
              ?.participantes ||
            []
          }

          usuarioAtualId={
            usuarioAtualId
          }

          onVoltar={() => {
            setAreaEntidadesAtiva(
              null
            );

            setOrigemFicha(
              ORIGENS_FICHA.DASHBOARD
            );
          }}

          onNovaEntidade={
            abrirCriacaoEntidade
          }

          onAbrirEntidade={
            abrirFicha
          }

          onArquivarEntidade={
            arquivarFicha
          }

          onExcluirEntidade={
            excluirFicha
          }

          onAlterarVisibilidadeEntidade={
            alterarVisibilidadeFicha
          }

          onAlterarTipoEntidade={
            alterarTipoEntidade
          }
        />
      );
    }


    if (!fichaAtual && diretorioAberto) {
      const somentePersonagens = telaPainel === "personagens";
      return <ManagerDirectory section={telaPainel} records={somentePersonagens ? personagens : fichasVisiveis}
        open={abrirFicha} onNewSheet={podeCriarFicha && (somentePersonagens || telaPainel === "fichas") ? abrirCriacao : undefined} />;
    }

    if (!fichaAtual && telaPainel === "inicio") {
      return <ManagerHome campaign={campanhaAtual} campaigns={campanhas.length} characters={personagens}
        sheetCount={fichasVisiveis.length} notes={anotacoesVisiveis.length}
        navigate={navegarPainel} onOpenSheet={abrirFicha} onNewSheet={abrirCriacao} canCreate={podeCriarFicha} />;
    }

    if (
      !fichaAtual
    ) {
      return (
        <DashboardCampanha
          campanha={
            campanhaAtual
          }

          entidades={
            fichas
          }

          ultimaEntidade={
            ultimaEntidade
          }

          participantes={
            campanhaAtual
              ?.participantes ||
            []
          }

          usuarioAtualId={
            usuarioAtualId
          }

          onAbrirConfiguracoes={() => abrirArea("configuracoes")}

          quantidadeAnotacoes={
            anotacoesVisiveis.length
          }

          estadoArquivo={
            estadoArquivo
          }

          onEstadoArquivoChange={
            setEstadoArquivo
          }

          onContinuar={
            abrirFicha
          }

          onAbrirEntidade={
            abrirFicha
          }

          onNovaFicha={
            abrirCriacao
          }

          onArquivarEntidade={
            arquivarFicha
          }

          onRestaurarEntidade={
            restaurarFicha
          }

          onExcluirEntidade={
            excluirFicha
          }

          onAlterarVisibilidadeEntidade={
            alterarVisibilidadeFicha
          }

          onAlterarTipoEntidade={
            alterarTipoEntidade
          }

          onAbrirArea={
            abrirArea
          }
        />
      );
    }


    return (
      <FichaDetalhes
        moduloInicial={["habilidades", "inventario"].includes(telaPainel) ? telaPainel : undefined}
        ficha={
          fichaAtual
        }

        entidadesCampanha={
          fichas
        }

        podeEditarDados={
          podeEditarEntidade(
            campanhaAtual,
            fichaAtual
          )
        }

        onSalvarModulo={
          salvarModuloFicha
        }

        alterarVida={
          alterarVida
        }

        alterarGP={
          alterarGP
        }

        alterarTP={
          alterarTP
        }

        alterarRitmoIndividual={
          alterarRitmoIndividual
        }

        alterarRitmoEquipe={
          alterarRitmoEquipe
        }

        alterarMomentum={
          alterarMomentum
        }

        definirMomentum={
          definirMomentum
        }

        definirMaximoRecurso={
          definirMaximoRecurso
        }

        definirEstado={
          definirEstado
        }

        alterarAtributo={
          alterarAtributo
        }

        definirAtributo={
          definirAtributo
        }

        adquirirArquetipo={
          adquirirArquetipo
        }

        definirArquetipoDestaque={
          definirArquetipoDestaque
        }

        removerArquetipo={
          removerArquetipo
        }

        adquirirTalentoPosicional={
          adquirirTalentoPosicional
        }

        removerTalentoPosicional={
          removerTalentoPosicional
        }

        atualizarTalentoPosicional={
          atualizarTalentoPosicional
        }

        calcularPorcentagem={
          calcularPorcentagem
        }

        criarHabilidade={
          criarHabilidade
        }

        editarHabilidade={
          editarHabilidade
        }

        excluirHabilidade={
          excluirHabilidade
        }

        onEditarPersonagem={() =>
          abrirEdicao(
            fichaAtual
          )
        }

        onVoltar={
          voltarDaFicha
        }
      />
    );
  }

  const active = areaCampanhaAtiva || (fichaAtual && !diretorioAberto ? "fichas" : telaPainel === "campanha" ? "inicio" : telaPainel);
  const pageKey = [idCampanhaAtual, telaPainel, areaCampanhaAtiva, areaEntidadesAtiva, fichaAtual?.id,
    criandoFicha, editandoFicha, dadosRemotosCarregados].join(":");

  return <ManagerLayout user={usuario} role={campanhaAtual ? (eMestreAtual ? "Mestre" : "Jogador") : undefined}
    hasCampaign={Boolean(campanhaAtual)} canConfigure={podeConfigurar} active={active} pageKey={pageKey}
    navigate={navegarPainel} onLogout={sair}>
    {renderizarPagina()}
  </ManagerLayout>;
}


function AplicacaoAutenticada() {
  const {
    usuario,
    carregando,
    configurado,
    sair
  } = useAuth();

  if (carregando) {
    return <main className="auth-shell"><ManagerLoading>Validando sessão…</ManagerLoading></main>;
  }


  if (!usuario) {
    return <AuthScreen configurado={configurado} />;
  }

  return <RPGManager usuario={usuario} sair={sair} />;
}


function App() {
  return <AuthProvider><AplicacaoAutenticada /></AuthProvider>;
}


export default App;
