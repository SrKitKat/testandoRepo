import React, { useEffect, useMemo, useState } from "react";
import "./FichaDetalhes.css";
import HabilidadesManager from "../habilidades/HabilidadesManager.jsx";
import { EvolucaoModulo, InventarioModulo, VinculosModulo } from "./ModulosPersistentes.jsx";

import {
  TIPOS_ENTIDADE,
  VISIBILIDADES_ENTIDADE,
  entidadeEstaArquivada
} from "../campanhas/campanhas.js";

import {
  arquetiposSuperOnze,
  talentosPosicionaisSuperOnze,
  FAMILIAS_ARQUETIPO,
  FAMILIAS_TALENTO
} from "../habilidades/data/conteudoSuperOnze.js";


const MODULOS = [
  {
    id: "resumo",
    icone: "👤",
    nome: "Resumo"
  },
  {
    id: "habilidades",
    icone: "⚡",
    nome: "Habilidades"
  },
  {
    id: "atributos",
    icone: "🛡️",
    nome: "Atributos"
  },
  {
    id: "recursos",
    icone: "◆",
    nome: "Recursos"
  },
  {
    id: "arquetipo",
    icone: "✦",
    nome: "Arquétipos"
  },
  {
    id: "talentos",
    icone: "🎯",
    nome: "Talentos"
  },
  {
    id: "ritmo",
    icone: "♫",
    nome: "Ritmo & Momentum"
  },
  {
    id: "condicoes",
    icone: "✚",
    nome: "Condições"
  },
  {
    id: "vinculos",
    icone: "♥",
    nome: "Vínculos"
  },
  {
    id: "evolucao",
    icone: "↗",
    nome: "Evolução"
  },
  {
    id: "inventario",
    icone: "🎒",
    nome: "Inventário"
  }
];


const MODULOS_VALIDOS = [
  ...MODULOS.map(
    modulo =>
      modulo.id
  ),
  "administracao"
];


const PREFIXO_MODULO_FICHA =
  "rpg-manager-modulo-ficha";


const RECURSOS_PRINCIPAIS = [
  {
    chave: "vida",
    nome: "Vida",
    icone: "♥",
    descricao:
      "Condição vital e dano sofrido."
  },
  {
    chave: "gp",
    nome: "GP",
    icone: "◆",
    descricao:
      "Esforço disponível para impactos, defesas e ações intensas."
  },
  {
    chave: "tp",
    nome: "TP",
    icone: "⚡",
    descricao:
      "Energia utilizada por técnicas e Hissatsu."
  }
];


const CATEGORIAS_ATRIBUTOS = [
  {
    id: "fisicos",
    titulo: "Físicos",
    descricao:
      "Capacidades corporais e desempenho físico.",
    chaves: [
      "forca",
      "destreza",
      "constituicao",
      "agilidade",
      "resistencia"
    ]
  },
  {
    id: "mentais",
    titulo: "Mentais",
    descricao:
      "Leitura, percepção e raciocínio.",
    chaves: [
      "visao",
      "percepcao",
      "inteligencia",
      "sabedoria"
    ]
  },
  {
    id: "sociais",
    titulo: "Sociais / Especiais",
    descricao:
      "Presença pessoal e fatores especiais.",
    chaves: [
      "sorte",
      "carisma"
    ]
  }
];


function criarChaveModuloFicha(
  fichaId
) {
  return `${PREFIXO_MODULO_FICHA}:${fichaId}`;
}


function moduloEhValido(
  modulo
) {
  return MODULOS_VALIDOS.includes(
    modulo
  );
}


function carregarModuloFicha(
  fichaId
) {
  if (
    fichaId === undefined ||
    fichaId === null
  ) {
    return "resumo";
  }


  try {
    const salvo =
      sessionStorage.getItem(
        criarChaveModuloFicha(
          fichaId
        )
      );


    if (
      salvo ===
      "momentum"
    ) {
      return "ritmo";
    }


    return moduloEhValido(
      salvo
    )
      ? salvo
      : "resumo";

  } catch {
    return "resumo";
  }
}


function normalizarIdentificador(
  valor
) {
  return String(
    valor || ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-zA-Z0-9]/g,
      ""
    )
    .toLocaleLowerCase(
      "pt-BR"
    );
}


function agruparAtributos(
  atributos
) {
  const entradas =
    Object.entries(
      atributos ||
      {}
    );


  const utilizados =
    new Set();


  const grupos =
    CATEGORIAS_ATRIBUTOS.map(
      categoria => {
        const itens =
          entradas.filter(
            ([nome]) => {
              const identificador =
                normalizarIdentificador(
                  nome
                );


              const pertence =
                categoria.chaves.includes(
                  identificador
                );


              if (pertence) {
                utilizados.add(
                  nome
                );
              }


              return pertence;
            }
          );


        return {
          ...categoria,
          itens
        };
      }
    );


  const outros =
    entradas.filter(
      ([nome]) =>
        !utilizados.has(
          nome
        )
    );


  if (
    outros.length >
    0
  ) {
    grupos.push({
      id: "outros",
      titulo: "Outros",
      descricao:
        "Atributos adicionais definidos pela campanha.",
      itens: outros
    });
  }


  return grupos.filter(
    grupo =>
      grupo.itens.length >
      0
  );
}


function formatarNomeTipo(
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


  return nomes[tipo] ||
    "Entidade";
}


function iconeTipo(
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


  return icones[tipo] ||
    "📄";
}


function formatarVisibilidade(
  visibilidade
) {
  if (
    visibilidade ===
    VISIBILIDADES_ENTIDADE.CAMPANHA
  ) {
    return "🌐 Campanha";
  }


  if (
    visibilidade ===
    VISIBILIDADES_ENTIDADE.MESTRE
  ) {
    return "👑 Mestre + proprietário";
  }


  if (
    visibilidade ===
    VISIBILIDADES_ENTIDADE.PROPRIETARIO
  ) {
    return "🔒 Privada";
  }


  if (
    visibilidade ===
    VISIBILIDADES_ENTIDADE.RESTRITA
  ) {
    return "👥 Restrita";
  }


  return "Não definida";
}


function nomeProprietario(
  ficha
) {
  const id =
    ficha?.proprietarioId;


  if (
    id ===
    "usuario-local"
  ) {
    return "Você";
  }


  if (
    id ===
    "jogador-local"
  ) {
    return "Jogador local";
  }


  return (
    ficha?.proprietarioNome ||
    id ||
    "Não identificado"
  );
}


function valorInformacao(
  valor
) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return "Não informado";
  }


  return valor;
}


function formatarChaveAtributo(
  chave
) {
  const nomesConhecidos = {
    forca: "Força",
    destreza: "Destreza",
    constituicao: "Constituição",
    agilidade: "Agilidade",
    resistencia: "Resistência",
    visao: "Visão",
    percepcao: "Percepção",
    inteligencia: "Inteligência",
    sabedoria: "Sabedoria",
    sorte: "Sorte",
    carisma: "Carisma"
  };


  const identificador =
    normalizarIdentificador(
      chave
    );


  if (
    nomesConhecidos[
      identificador
    ]
  ) {
    return nomesConhecidos[
      identificador
    ];
  }


  return String(
    chave || ""
  )
    .replace(
      /([A-Z])/g,
      " $1"
    )
    .replace(
      /^./,
      letra =>
        letra.toUpperCase()
    );
}


function obterPassivaPropria(
  ficha
) {
  const valor =
    ficha?.passivaPropria ??
    ficha?.passivaNatural ??
    ficha?.passiva ??
    null;


  if (!valor) {
    return null;
  }


  if (
    typeof valor ===
    "string"
  ) {
    return {
      nome: valor,
      descricao: ""
    };
  }


  if (
    typeof valor ===
    "object"
  ) {
    return {
      nome:
        valor.nome ||
        valor.titulo ||
        "Passiva",

      descricao:
        valor.descricao ||
        valor.efeito ||
        ""
    };
  }


  return null;
}


function condicaoFisicaNormal(
  valor
) {
  const texto =
    normalizarIdentificador(
      valor
    );


  return [
    "",
    "normal",
    "bem",
    "saudavel",
    "estavel"
  ].includes(
    texto
  );
}


function condicaoMentalNormal(
  valor
) {
  const texto =
    normalizarIdentificador(
      valor
    );


  return [
    "",
    "normal",
    "estavel",
    "focado",
    "focada",
    "calmo",
    "calma"
  ].includes(
    texto
  );
}


function nomeFamiliaArquetipo(
  familia
) {
  const nomes = {
    [FAMILIAS_ARQUETIPO.INTELECTUAL]:
      "Intelectual",

    [FAMILIAS_ARQUETIPO.INSPIRADOR]:
      "Inspirador",

    [FAMILIAS_ARQUETIPO.EXPLOSIVO]:
      "Explosivo",

    [FAMILIAS_ARQUETIPO.CRIATIVO]:
      "Criativo",

    [FAMILIAS_ARQUETIPO.COMPETITIVO]:
      "Competitivo"
  };


  return nomes[familia] ||
    "Sem família";
}


function FichaDetalhes({
  ficha,
  moduloInicial,

  entidadesCampanha = [],
  podeEditarDados = false,
  onSalvarModulo,

  alterarVida,
  alterarGP,
  alterarTP,

  alterarRitmoIndividual,
  alterarRitmoEquipe,

  alterarMomentum,
  definirMomentum,

  definirMaximoRecurso,
  definirEstado,

  alterarAtributo,
  definirAtributo,

  adquirirArquetipo,
  definirArquetipoDestaque,
  removerArquetipo,

  adquirirTalentoPosicional,
  removerTalentoPosicional,
  atualizarTalentoPosicional,

  calcularPorcentagem,

  criarHabilidade,
  editarHabilidade,
  excluirHabilidade,

  onEditarPersonagem,
  onVoltar
}) {
  const [
    moduloAtivo,
    setModuloAtivo
  ] = useState(
    () =>
      moduloInicial || carregarModuloFicha(
        ficha?.id
      )
  );


  const [
    editandoAtributos,
    setEditandoAtributos
  ] = useState(false);


  const [
    editandoLimites,
    setEditandoLimites
  ] = useState(false);


  const [
    editandoCondicoes,
    setEditandoCondicoes
  ] = useState(false);


  const [
    visualizacaoArquetipos,
    setVisualizacaoArquetipos
  ] = useState(
    "adquiridos"
  );


  const [
    filtroFamiliaArquetipo,
    setFiltroFamiliaArquetipo
  ] = useState(
    "todos"
  );


  const [
    visualizacaoTalentos,
    setVisualizacaoTalentos
  ] = useState(
    "adquiridos"
  );


  const [
    filtroFamiliaTalento,
    setFiltroFamiliaTalento
  ] = useState(
    "todos"
  );


  const [
    edicaoTalento,
    setEdicaoTalento
  ] = useState(null);


  const todosTalentos =
    useMemo(
      () =>
        Object.entries(
          talentosPosicionaisSuperOnze
        ).flatMap(
          ([
            familia,
            talentos
          ]) =>
            talentos.map(
              talento => ({
                ...talento,

                familia:
                  talento.familia ||
                  familia
              })
            )
        ),
      []
    );


  const arquetiposAdquiridos =
    useMemo(
      () => {
        const registros = [];

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


          const catalogo =
            arquetiposSuperOnze.find(
              arquetipo =>
                arquetipo.id ===
                id
            );


          if (
            typeof valor ===
            "object"
          ) {
            registros.push({
              ...(catalogo || {}),
              ...valor,
              id
            });

            return;
          }


          registros.push(
            catalogo || {
              id,
              nome: id,
              icone: "✦"
            }
          );
        }


        if (
          Array.isArray(
            ficha?.arquetiposAdquiridos
          )
        ) {
          ficha
            .arquetiposAdquiridos
            .forEach(
              adicionar
            );
        }


        const principal =
          ficha?.arquetipoId ||
          ficha?.arquetipo?.id ||
          (
            typeof ficha?.arquetipo ===
            "string"
              ? ficha.arquetipo
              : null
          );


        if (principal) {
          adicionar(
            principal
          );
        }


        return registros;
      },
      [
        ficha
      ]
    );


  const arquetipoAtual =
    useMemo(
      () => {
        const valor =
          ficha?.arquetipoId ||
          ficha?.arquetipo?.id ||
          (
            typeof ficha?.arquetipo ===
            "string"
              ? ficha.arquetipo
              : null
          ) ||
          arquetiposAdquiridos[
            0
          ]?.id ||
          null;


        if (!valor) {
          return null;
        }


        return (
          arquetiposAdquiridos.find(
            arquetipo =>
              arquetipo.id ===
              valor
          ) ||
          arquetiposSuperOnze.find(
            arquetipo =>
              arquetipo.id ===
              valor
          ) ||
          (
            typeof ficha?.arquetipo ===
            "object"
              ? ficha.arquetipo
              : null
          )
        );
      },
      [
        ficha,
        arquetiposAdquiridos
      ]
    );


  const idsArquetiposAdquiridos =
    useMemo(
      () =>
        new Set(
          arquetiposAdquiridos.map(
            arquetipo =>
              arquetipo.id
          )
        ),
      [
        arquetiposAdquiridos
      ]
    );


  const arquetiposBiblioteca =
    useMemo(
      () =>
        arquetiposSuperOnze.filter(
          arquetipo =>
            filtroFamiliaArquetipo ===
              "todos" ||
            arquetipo.familia ===
              filtroFamiliaArquetipo
        ),
      [
        filtroFamiliaArquetipo
      ]
    );


  const talentosAdquiridos =
    useMemo(
      () => {
        const salvos =
          ficha?.talentosPosicionais ||
          ficha?.talentos ||
          [];


        if (
          !Array.isArray(
            salvos
          )
        ) {
          return [];
        }


        const encontrados =
          new Set();


        return salvos
          .map(
            talento => {
              const id =
                typeof talento ===
                "string"
                  ? talento
                  : talento?.id;


              if (
                typeof id !==
                  "string" ||
                !id.trim() ||
                encontrados.has(
                  id
                )
              ) {
                return null;
              }


              encontrados.add(
                id
              );


              const catalogo =
                todosTalentos.find(
                  item =>
                    item.id ===
                    id
                );


              const salvo =
                typeof talento ===
                "object"
                  ? talento
                  : {};


              return {
                ...(catalogo || {
                  id,
                  nome: id,
                  icone: "🎯"
                }),

                ...salvo,

                id,

                grau:
                  Math.max(
                    1,
                    Number(
                      salvo.grau
                    ) ||
                    1
                  ),

                observacaoEvolucao:
                  typeof salvo
                    .observacaoEvolucao ===
                  "string"
                    ? salvo.observacaoEvolucao
                    : ""
              };
            }
          )
          .filter(Boolean);
      },
      [
        ficha,
        todosTalentos
      ]
    );


  const idsTalentosAdquiridos =
    useMemo(
      () =>
        new Set(
          talentosAdquiridos.map(
            talento =>
              talento.id
          )
        ),
      [
        talentosAdquiridos
      ]
    );


  useEffect(
    () => {
      if (
        ficha?.id === undefined ||
        ficha?.id === null
      ) {
        return;
      }


      setModuloAtivo(
        moduloInicial || carregarModuloFicha(
          ficha.id
        )
      );


      setEditandoAtributos(
        false
      );


      setEditandoLimites(
        false
      );


      setEditandoCondicoes(
        false
      );


      setVisualizacaoArquetipos(
        "adquiridos"
      );


      setFiltroFamiliaArquetipo(
        "todos"
      );


      setVisualizacaoTalentos(
        "adquiridos"
      );


      setFiltroFamiliaTalento(
        "todos"
      );


      setEdicaoTalento(
        null
      );
    },
    [
      ficha?.id, moduloInicial
    ]
  );


  useEffect(
    () => {
      if (
        ficha?.id === undefined ||
        ficha?.id === null ||
        !moduloEhValido(
          moduloAtivo
        )
      ) {
        return;
      }


      try {
        sessionStorage.setItem(
          criarChaveModuloFicha(
            ficha.id
          ),
          moduloAtivo
        );

      } catch {
        // Continua funcionando sem sessionStorage.
      }
    },
    [
      ficha?.id,
      moduloAtivo
    ]
  );


  if (!ficha) {
    return null;
  }


  const arquivada =
    entidadeEstaArquivada(
      ficha
    );


  const tipoEntidade =
    ficha.tipoEntidade ||
    TIPOS_ENTIDADE.PERSONAGEM;


  const informacoes = {
    idade:
      ficha?.informacoes?.idade ??
      ficha.idade,

    altura:
      ficha?.informacoes?.altura ??
      ficha.altura,

    peDominante:
      ficha?.informacoes?.peDominante ??
      ficha.peDominante,

    raca:
      ficha?.informacoes?.raca ??
      ficha.raca,

    nivel:
      ficha?.informacoes?.nivel ??
      ficha.nivel ??
      1,

    experiencia:
      ficha?.informacoes?.experiencia ??
      ficha.experiencia ??
      0,

    experienciaMax:
      ficha?.informacoes?.experienciaMax ??
      ficha.experienciaMax ??
      100,

    posicao:
      ficha?.informacoes?.posicao ??
      ficha.posicao
  };


  const statusCampanha =
    ficha?.status ||
    ficha?.informacoes?.status ||
    "";


  const elemento =
    ficha?.elemento ||
    ficha?.informacoes?.elemento ||
    "";


  const dinheiro =
    ficha?.dinheiro ??
    ficha?.informacoes?.dinheiro ??
    null;


  const moeda =
    ficha?.moeda ||
    ficha?.informacoes?.moeda ||
    "Yen";


  const passivaPropria =
    obterPassivaPropria(
      ficha
    );


  const temDetalhesCampanha =
    Boolean(
      statusCampanha ||
      elemento ||
      dinheiro !== null
    );


  function trocarModulo(
    modulo
  ) {
    if (
      !moduloEhValido(
        modulo
      )
    ) {
      return;
    }


    setModuloAtivo(
      modulo
    );
  }


  function obterRecurso(
    chave
  ) {
    const salvo =
      ficha?.recursos?.[chave];


    if (salvo) {
      return {
        atual:
          Number(
            salvo.atual
          ) ||
          0,

        maximo:
          Number(
            salvo.maximo
          ) ||
          0
      };
    }


    if (
      chave ===
      "vida"
    ) {
      return {
        atual:
          Number(
            ficha.vida
          ) ||
          0,

        maximo:
          Number(
            ficha.vidaMax
          ) ||
          0
      };
    }


    if (
      chave ===
      "tp"
    ) {
      return {
        atual:
          Number(
            ficha.tp
          ) ||
          0,

        maximo:
          Number(
            ficha.tpMax
          ) ||
          0
      };
    }


    return {
      atual: 0,
      maximo: 0
    };
  }


  function porcentagem(
    atual,
    maximo
  ) {
    if (
      typeof calcularPorcentagem ===
      "function"
    ) {
      return calcularPorcentagem(
        atual,
        maximo
      );
    }


    if (
      Number(
        maximo
      ) <=
      0
    ) {
      return 0;
    }


    return Math.min(
      100,
      Math.max(
        0,
        (
          Number(
            atual
          ) /
          Number(
            maximo
          )
        ) *
        100
      )
    );
  }


  const recursosPrincipais =
    RECURSOS_PRINCIPAIS.map(
      configuracao => ({
        ...configuracao,

        ...obterRecurso(
          configuracao.chave
        )
      })
    );


  const ritmoIndividual =
    obterRecurso(
      "ritmoIndividual"
    );


  const ritmoEquipe =
    obterRecurso(
      "ritmoEquipe"
    );


  const momentumAtual =
    Math.max(
      0,
      Number(
        ficha.momentum
      ) ||
      0
    );


  const momentumMaximo =
    Math.max(
      0,
      Number(
        ficha.momentumMax
      ) ||
      0
    );


  const estadoFisico =
    ficha?.estados?.fisico ||
    "Normal";


  const estadoMental =
    ficha?.estados?.mental ||
    "Estável";


  const atributosRapidos =
    agruparAtributos(
      ficha.atributos
    ).flatMap(
      grupo =>
        grupo.itens
    );


  function familiaSugerida() {
    const posicao =
      String(
        informacoes.posicao ||
        ""
      )
        .toLocaleLowerCase(
          "pt-BR"
        );


    if (
      posicao.includes(
        "goleiro"
      )
    ) {
      return FAMILIAS_TALENTO.GOLEIRO;
    }


    if (
      posicao.includes(
        "zague"
      ) ||
      posicao.includes(
        "defesa"
      ) ||
      posicao.includes(
        "líbero"
      ) ||
      posicao.includes(
        "libero"
      ) ||
      posicao.includes(
        "lateral"
      )
    ) {
      return FAMILIAS_TALENTO.DEFENSIVO;
    }


    if (
      posicao.includes(
        "meio"
      ) ||
      posicao.includes(
        "meia"
      ) ||
      posicao.includes(
        "volante"
      )
    ) {
      return FAMILIAS_TALENTO.MEIO_CAMPO;
    }


    return FAMILIAS_TALENTO.OFENSIVO;
  }


  const familiaAfinidade =
    familiaSugerida();


  const talentosBiblioteca =
    todosTalentos.filter(
      talento =>
        filtroFamiliaTalento ===
          "todos" ||
        talento.familia ===
          filtroFamiliaTalento
    );


  function nomeFamilia(
    familia
  ) {
    const nomes = {
      [FAMILIAS_TALENTO.OFENSIVO]:
        "Ofensiva",

      [FAMILIAS_TALENTO.DEFENSIVO]:
        "Defensiva",

      [FAMILIAS_TALENTO.MEIO_CAMPO]:
        "Meio-campo",

      [FAMILIAS_TALENTO.GOLEIRO]:
        "Goleiro"
    };


    return nomes[familia] ||
      "Livre";
  }


  function alterarRecursoRapido(
    chave,
    quantidade
  ) {
    if (
      chave ===
      "vida"
    ) {
      alterarVida?.(
        quantidade
      );
    }


    if (
      chave ===
      "gp"
    ) {
      alterarGP?.(
        quantidade
      );
    }


    if (
      chave ===
      "tp"
    ) {
      alterarTP?.(
        quantidade
      );
    }
  }


  function alterarRitmoRapido(
    chave,
    quantidade
  ) {
    if (
      chave ===
      "individual"
    ) {
      alterarRitmoIndividual?.(
        quantidade
      );
    }


    if (
      chave ===
      "equipe"
    ) {
      alterarRitmoEquipe?.(
        quantidade
      );
    }
  }


  function abrirEdicaoTalento(
    talento
  ) {
    setEdicaoTalento({
      id:
        talento.id,

      grau:
        Math.max(
          1,
          Number(
            talento.grau
          ) ||
          1
        ),

      observacaoEvolucao:
        talento.observacaoEvolucao ||
        ""
    });
  }


  function alterarCampoEdicaoTalento(
    campo,
    valor
  ) {
    setEdicaoTalento(
      anterior => {
        if (!anterior) {
          return anterior;
        }


        return {
          ...anterior,
          [campo]:
            valor
        };
      }
    );
  }


  function salvarEdicaoTalento() {
    if (
      !edicaoTalento
    ) {
      return;
    }


    const grau =
      Math.max(
        1,
        Math.floor(
          Number(
            edicaoTalento.grau
          ) ||
          1
        )
      );


    atualizarTalentoPosicional?.(
      edicaoTalento.id,
      {
        grau,

        observacaoEvolucao:
          String(
            edicaoTalento
              .observacaoEvolucao ||
            ""
          )
      }
    );


    setEdicaoTalento(
      null
    );
  }


  function ResumoBibliotecaAdquiridos({
    itens,
    destaqueId = null
  }) {
    const limite =
      4;


    const visiveis =
      itens.slice(
        0,
        limite
      );


    const restantes =
      Math.max(
        0,
        itens.length -
        limite
      );


    return (
      <div className="ficha-nova-biblioteca-adquiridos-resumo">

        <div className="ficha-nova-biblioteca-adquiridos-cabecalho">

          <div>

            <span>
              JÁ ADQUIRIDOS ·{" "}
              {itens.length}
            </span>

            <p>
              Referência rápida enquanto você consulta a biblioteca.
            </p>

          </div>

        </div>


        {itens.length >
        0 ? (

          <div className="ficha-nova-biblioteca-adquiridos-chips">

            {visiveis.map(
              item => (

                <span
                  key={
                    item.id
                  }
                  className={
                    destaqueId ===
                    item.id
                      ? "ficha-nova-biblioteca-chip ficha-nova-biblioteca-chip-destaque"
                      : "ficha-nova-biblioteca-chip"
                  }
                >
                  {destaqueId ===
                  item.id
                    ? "★ "
                    : ""}

                  {item.nome}
                </span>

              )
            )}


            {restantes >
            0 && (

              <span className="ficha-nova-biblioteca-chip ficha-nova-biblioteca-chip-restante">
                +{restantes}
              </span>

            )}

          </div>

        ) : (

          <p className="ficha-nova-biblioteca-adquiridos-vazio">
            Nenhum adquirido ainda.
          </p>

        )}

      </div>
    );
  }


  function Resumo() {
    return (
      <div className="ficha-nova-resumo">

        <section className="ficha-nova-resumo-grade">

          <article className="ficha-nova-painel ficha-nova-perfil">

            <p className="ficha-nova-etiqueta">
              PERFIL
            </p>

            <h2>
              {ficha.nome}
            </h2>


            <div className="ficha-nova-info-lista">

              <div>
                <span>Idade</span>

                <strong>
                  {valorInformacao(
                    informacoes.idade
                  )}
                </strong>
              </div>


              <div>
                <span>Altura</span>

                <strong>
                  {valorInformacao(
                    informacoes.altura
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Pé dominante
                </span>

                <strong>
                  {valorInformacao(
                    informacoes.peDominante
                  )}
                </strong>
              </div>


              <div>
                <span>Raça</span>

                <strong>
                  {valorInformacao(
                    informacoes.raca
                  )}
                </strong>
              </div>


              <div>
                <span>Posição</span>

                <strong>
                  {valorInformacao(
                    informacoes.posicao
                  )}
                </strong>
              </div>


              <div>
                <span>Nível</span>

                <strong>
                  {informacoes.nivel}
                </strong>
              </div>


              <div>
                <span>
                  Experiência
                </span>

                <strong>
                  {informacoes.experiencia}
                  {" / "}
                  {informacoes.experienciaMax}
                </strong>
              </div>

            </div>

          </article>


          <article className="ficha-nova-painel ficha-nova-retrato">

            {ficha.imagem ? (

              <img
                src={
                  ficha.imagem
                }
                alt={
                  ficha.nome
                }
              />

            ) : (

              <div className="ficha-nova-retrato-vazio">

                <span>
                  {iconeTipo(
                    tipoEntidade
                  )}
                </span>

                <small>
                  Sem imagem
                </small>

              </div>

            )}

          </article>


          <article className="ficha-nova-painel ficha-nova-recursos-resumo">

            <div className="ficha-nova-bloco-titulo">

              <div>

                <p className="ficha-nova-etiqueta">
                  ESTADO ATUAL
                </p>

                <h3>
                  Sessão
                </h3>

              </div>


              <button
                type="button"
                onClick={() =>
                  trocarModulo(
                    "recursos"
                  )
                }
              >
                GERENCIAR →
              </button>

            </div>


            <div className="ficha-nova-recursos-resumo-lista">

              {recursosPrincipais.map(
                recurso => {
                  const percentual =
                    porcentagem(
                      recurso.atual,
                      recurso.maximo
                    );


                  return (
                    <div
                      key={
                        recurso.chave
                      }
                      className="ficha-nova-recurso-resumo"
                    >

                      <div>

                        <span>
                          {recurso.icone}
                          {" "}
                          {recurso.nome}
                        </span>

                        <strong>
                          {recurso.atual}
                          {" / "}
                          {recurso.maximo}
                        </strong>

                      </div>


                      <div className="ficha-nova-barra">

                        <div
                          className="ficha-nova-barra-preenchimento"
                          style={{
                            width:
                              `${percentual}%`
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>


            <div className="ficha-nova-resumo-divisor">

              <div className="ficha-nova-resumo-divisor-topo">

                <span>
                  FLUXO
                </span>

                <button
                  type="button"
                  onClick={() =>
                    trocarModulo(
                      "ritmo"
                    )
                  }
                >
                  VER RITMO →
                </button>

              </div>


              <div className="ficha-nova-resumo-fluxo">

                <div>

                  <span>
                    ♫ Individual
                  </span>

                  <strong>
                    {ritmoIndividual.atual}
                    {" / "}
                    {ritmoIndividual.maximo}
                  </strong>

                </div>


                <div>

                  <span>
                    ♫ Equipe
                  </span>

                  <strong>
                    {ritmoEquipe.atual}
                    {" / "}
                    {ritmoEquipe.maximo}
                  </strong>

                </div>


                <div className="ficha-nova-resumo-momentum">

                  <span>
                    🔥 Momentum
                  </span>

                  <strong>
                    {momentumAtual}

                    {momentumMaximo >
                    0
                      ? ` / ${momentumMaximo}`
                      : ""}
                  </strong>

                </div>

              </div>

            </div>


            <div className="ficha-nova-resumo-divisor">

              <div className="ficha-nova-resumo-divisor-topo">

                <span>
                  CONDIÇÕES
                </span>

                <button
                  type="button"
                  onClick={() =>
                    trocarModulo(
                      "condicoes"
                    )
                  }
                >
                  VER →
                </button>

              </div>


              <div className="ficha-nova-resumo-condicoes">

                <div
                  className={
                    condicaoFisicaNormal(
                      estadoFisico
                    )
                      ? "ficha-nova-condicao-resumo"
                      : "ficha-nova-condicao-resumo ficha-nova-condicao-resumo-alerta"
                  }
                >

                  <span>
                    💪 Físico
                  </span>

                  <strong>
                    {estadoFisico}
                  </strong>

                </div>


                <div
                  className={
                    condicaoMentalNormal(
                      estadoMental
                    )
                      ? "ficha-nova-condicao-resumo"
                      : "ficha-nova-condicao-resumo ficha-nova-condicao-resumo-alerta"
                  }
                >

                  <span>
                    🧠 Mental
                  </span>

                  <strong>
                    {estadoMental}
                  </strong>

                </div>

              </div>

            </div>

          </article>

        </section>


        {temDetalhesCampanha && (

          <section className="ficha-nova-faixa-campanha">

            {statusCampanha && (

              <div>

                <span>
                  STATUS
                </span>

                <strong>
                  {statusCampanha}
                </strong>

              </div>

            )}


            {elemento && (

              <div>

                <span>
                  ELEMENTO
                </span>

                <strong>
                  {elemento}
                </strong>

              </div>

            )}


            {dinheiro !==
            null && (

              <div>

                <span>
                  DINHEIRO
                </span>

                <strong>
                  {dinheiro}
                  {" "}
                  {moeda}
                </strong>

              </div>

            )}

          </section>

        )}


        {passivaPropria && (

          <section className="ficha-nova-painel ficha-nova-passiva-propria">

            <div className="ficha-nova-passiva-propria-icone">
              ✧
            </div>


            <div>

              <p className="ficha-nova-etiqueta">
                CARACTERÍSTICA / PASSIVA PRÓPRIA
              </p>

              <h3>
                {passivaPropria.nome}
              </h3>


              {passivaPropria.descricao && (

                <p>
                  {passivaPropria.descricao}
                </p>

              )}

            </div>

          </section>

        )}


        <section className="ficha-nova-resumo-secundario">

          <article className="ficha-nova-painel">

            <div className="ficha-nova-bloco-titulo">

              <div>

                <p className="ficha-nova-etiqueta">
                  ARQUÉTIPO EM DESTAQUE
                </p>

                <h3>
                  {arquetipoAtual
                    ? `${arquetipoAtual.icone || "✦"} ${arquetipoAtual.nome}`
                    : "Ainda não definido"}
                </h3>

              </div>


              <button
                type="button"
                onClick={() =>
                  trocarModulo(
                    "arquetipo"
                  )
                }
              >
                VER →
              </button>

            </div>


            <p className="ficha-nova-texto-secundario">

              {arquetiposAdquiridos.length >
              0
                ? (
                  <>
                    {arquetiposAdquiridos.length}
                    {" "}

                    {arquetiposAdquiridos.length ===
                    1
                      ? "arquétipo adquirido"
                      : "arquétipos adquiridos"}.

                    {arquetipoAtual?.passiva?.nome
                      ? ` Passiva em destaque: ${arquetipoAtual.passiva.nome}.`
                      : ""}
                  </>
                )
                : "Arquétipo, passiva própria e Talentos Posicionais são conceitos separados."}

            </p>

          </article>


          <article className="ficha-nova-painel">

            <div className="ficha-nova-bloco-titulo">

              <div>

                <p className="ficha-nova-etiqueta">
                  TALENTOS
                </p>

                <h3>
                  {talentosAdquiridos.length ===
                  1
                    ? "1 talento adquirido"
                    : `${talentosAdquiridos.length} talentos adquiridos`}
                </h3>

              </div>


              <button
                type="button"
                onClick={() =>
                  trocarModulo(
                    "talentos"
                  )
                }
              >
                VER →
              </button>

            </div>


            <p className="ficha-nova-texto-secundario">

              Afinidade da posição:{" "}

              <strong>
                {nomeFamilia(
                  familiaAfinidade
                )}
              </strong>.

            </p>

          </article>

        </section>


        <section className="ficha-nova-painel ficha-nova-atributos-rapidos">

          <div className="ficha-nova-bloco-titulo">

            <div>

              <p className="ficha-nova-etiqueta">
                CONSULTA RÁPIDA
              </p>

              <h3>
                Atributos
              </h3>

            </div>


            <button
              type="button"
              onClick={() =>
                trocarModulo(
                  "atributos"
                )
              }
            >
              VER ATRIBUTOS →
            </button>

          </div>


          <p className="ficha-nova-atributos-rapidos-nota">
            Valores para consulta durante a sessão. A edição continua concentrada no módulo de Atributos.
          </p>


          <div className="ficha-nova-atributos-rapidos-grid">

            {atributosRapidos.map(
              ([
                nome,
                valor
              ]) => (

                <div
                  key={
                    nome
                  }
                  className="ficha-nova-atributo-rapido"
                >

                  <span>
                    {formatarChaveAtributo(
                      nome
                    )}
                  </span>

                  <strong>
                    {valor}
                  </strong>

                </div>

              )
            )}

          </div>

        </section>

      </div>
    );
  }


  function Habilidades() {
    const habilidades =
      Array.isArray(
        ficha.habilidades
      )
        ? ficha.habilidades
        : [];


    return (
      <section className="ficha-nova-modulo">

        <HabilidadesManager
          habilidades={
            habilidades
          }

          atributosJogador={
            ficha.atributos ||
            {}
          }

          somenteLeitura={
            arquivada
          }

          onCriar={
            criarHabilidade
          }

          onEditar={
            editarHabilidade
          }

          onExcluir={
            excluirHabilidade
          }
        />

      </section>
    );
  }


  function Atributos() {
    const grupos =
      agruparAtributos(
        ficha.atributos
      );


    return (
      <section className="ficha-nova-modulo">

        <header className="ficha-nova-modulo-topo ficha-nova-atributos-topo">

          <div>

            <p className="ficha-nova-etiqueta">
              FICHA
            </p>

            <h2>
              Atributos
            </h2>

            <p>
              Valores relativamente permanentes da entidade. Resistência pertence a este grupo e não é consumida como recurso.
            </p>

          </div>


          {!arquivada && (

            <button
              type="button"
              className={
                editandoAtributos
                  ? "ficha-nova-botao-principal"
                  : "ficha-nova-botao-secundario"
              }
              onClick={() =>
                setEditandoAtributos(
                  anterior =>
                    !anterior
                )
              }
            >
              {editandoAtributos
                ? "✓ CONCLUIR EDIÇÃO"
                : "✏ EDITAR ATRIBUTOS"}
            </button>

          )}

        </header>


        <div className="ficha-nova-atributos-legenda">

          <span>
            {editandoAtributos
              ? "MODO DE EDIÇÃO"
              : "VISUALIZAÇÃO"}
          </span>

          <p>
            {editandoAtributos
              ? "Os valores são atualizados imediatamente. Use este modo somente quando houver mudança real no personagem."
              : "Os controles ficam escondidos para que a ficha permaneça limpa durante a sessão."}
          </p>

        </div>


        <div className="ficha-nova-atributos-secoes">

          {grupos.map(
            grupo => (

              <section
                key={
                  grupo.id
                }
                className="ficha-nova-atributos-grupo"
              >

                <header className="ficha-nova-atributos-grupo-topo">

                  <div>

                    <p className="ficha-nova-etiqueta">
                      {grupo.titulo.toUpperCase()}
                    </p>

                    <span>
                      {grupo.descricao}
                    </span>

                  </div>


                  <small>
                    {grupo.itens.length}{" "}

                    {grupo.itens.length ===
                    1
                      ? "atributo"
                      : "atributos"}
                  </small>

                </header>


                <div className="ficha-nova-atributos-grid">

                  {grupo.itens.map(
                    ([
                      nome,
                      valor
                    ]) => (

                      <article
                        key={
                          nome
                        }
                        className={
                          editandoAtributos
                            ? "ficha-nova-atributo ficha-nova-atributo-editando"
                            : "ficha-nova-atributo"
                        }
                      >

                        <span className="ficha-nova-atributo-nome">
                          {formatarChaveAtributo(
                            nome
                          )}
                        </span>


                        {!editandoAtributos ? (

                          <strong className="ficha-nova-atributo-valor">
                            {valor}
                          </strong>

                        ) : (

                          <div className="ficha-nova-atributo-controle">

                            <button
                              type="button"
                              onClick={() =>
                                alterarAtributo?.(
                                  nome,
                                  -1
                                )
                              }
                            >
                              −
                            </button>


                            <input
                              type="number"
                              min="0"
                              value={
                                valor
                              }
                              onChange={
                                evento =>
                                  definirAtributo?.(
                                    nome,
                                    evento
                                      .target
                                      .value
                                  )
                              }
                            />


                            <button
                              type="button"
                              onClick={() =>
                                alterarAtributo?.(
                                  nome,
                                  1
                                )
                              }
                            >
                              +
                            </button>

                          </div>

                        )}

                      </article>

                    )
                  )}

                </div>

              </section>

            )
          )}

        </div>

      </section>
    );
  }


  function Recursos() {
    return (
      <section className="ficha-nova-modulo">

        <header className="ficha-nova-modulo-topo">

          <div>

            <p className="ficha-nova-etiqueta">
              SESSÃO
            </p>

            <h2>
              Recursos
            </h2>

            <p>
              Vida, GP e TP mudam durante partidas, treinos e acontecimentos narrativos.
            </p>

          </div>


          {!arquivada && (

            <button
              type="button"
              className={
                editandoLimites
                  ? "ficha-nova-botao-principal"
                  : "ficha-nova-botao-secundario"
              }
              onClick={() =>
                setEditandoLimites(
                  anterior =>
                    !anterior
                )
              }
            >
              {editandoLimites
                ? "✓ CONCLUIR"
                : "⚙ EDITAR LIMITES"}
            </button>

          )}

        </header>


        <div className="ficha-nova-recursos-modulo">

          {recursosPrincipais.map(
            recurso => {
              const percentual =
                porcentagem(
                  recurso.atual,
                  recurso.maximo
                );


              return (
                <article
                  key={
                    recurso.chave
                  }
                  className="ficha-nova-recurso-card"
                >

                  <header>

                    <div className="ficha-nova-recurso-icone">
                      {recurso.icone}
                    </div>


                    <div>

                      <p className="ficha-nova-etiqueta">
                        RECURSO
                      </p>

                      <h3>
                        {recurso.nome}
                      </h3>

                      <p>
                        {recurso.descricao}
                      </p>

                    </div>

                  </header>


                  <div className="ficha-nova-recurso-valor">

                    <strong>
                      {recurso.atual}
                    </strong>

                    <span>
                      / {recurso.maximo}
                    </span>

                  </div>


                  <div className="ficha-nova-barra ficha-nova-barra-grande">

                    <div
                      className="ficha-nova-barra-preenchimento"
                      style={{
                        width:
                          `${percentual}%`
                      }}
                    />

                  </div>


                  {!arquivada && (

                    <div className="ficha-nova-recurso-botoes">

                      {[
                        -10,
                        -1,
                        1,
                        10
                      ].map(
                        quantidade => (

                          <button
                            key={
                              quantidade
                            }
                            type="button"
                            onClick={() =>
                              alterarRecursoRapido(
                                recurso.chave,
                                quantidade
                              )
                            }
                          >
                            {quantidade >
                            0
                              ? "+"
                              : ""}

                            {quantidade}
                          </button>

                        )
                      )}

                    </div>

                  )}


                  {editandoLimites &&
                  !arquivada && (

                    <div className="ficha-nova-recurso-limite">

                      <label>

                        <span>
                          VALOR MÁXIMO
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={
                            recurso.maximo
                          }
                          onChange={
                            evento =>
                              definirMaximoRecurso?.(
                                recurso.chave,
                                evento
                                  .target
                                  .value
                              )
                          }
                        />

                      </label>


                      <p>
                        Alterar o máximo é uma mudança estrutural do personagem, não uma ação comum de sessão.
                      </p>

                    </div>

                  )}

                </article>
              );
            }
          )}

        </div>


        <div className="ficha-nova-aviso">

          <span>
            ◯
          </span>

          <p>
            <strong>
              Resistência é um atributo.
            </strong>{" "}
            Ela pode ser consultada no Resumo junto aos demais atributos e alterada no módulo de Atributos.
          </p>

        </div>

      </section>
    );
  }


  function Arquetipo() {
    const familias = [
      {
        id: "todos",
        nome: "Todos"
      },
      {
        id:
          FAMILIAS_ARQUETIPO.INTELECTUAL,
        nome: "Intelectuais"
      },
      {
        id:
          FAMILIAS_ARQUETIPO.INSPIRADOR,
        nome: "Inspiradores"
      },
      {
        id:
          FAMILIAS_ARQUETIPO.EXPLOSIVO,
        nome: "Explosivos"
      },
      {
        id:
          FAMILIAS_ARQUETIPO.CRIATIVO,
        nome: "Criativos"
      },
      {
        id:
          FAMILIAS_ARQUETIPO.COMPETITIVO,
        nome: "Competitivos"
      }
    ];


    return (
      <section className="ficha-nova-modulo">

        <header className="ficha-nova-modulo-topo">

          <div>

            <p className="ficha-nova-etiqueta">
              IDENTIDADE
            </p>

            <h2>
              Arquétipos
            </h2>

            <p>
              Arquétipos adquiridos pertencem ao personagem. A Biblioteca fica separada para consulta e novas aquisições.
            </p>

          </div>

        </header>


        <div
          className="ficha-nova-subnavegacao"
          role="tablist"
          aria-label="Visualização de Arquétipos"
        >

          <button
            type="button"
            role="tab"
            aria-selected={
              visualizacaoArquetipos ===
              "adquiridos"
            }
            className={
              visualizacaoArquetipos ===
              "adquiridos"
                ? "ficha-nova-subnavegacao-botao ficha-nova-subnavegacao-botao-ativo"
                : "ficha-nova-subnavegacao-botao"
            }
            onClick={() =>
              setVisualizacaoArquetipos(
                "adquiridos"
              )
            }
          >
            ADQUIRIDOS

            <span>
              {arquetiposAdquiridos.length}
            </span>
          </button>


          <button
            type="button"
            role="tab"
            aria-selected={
              visualizacaoArquetipos ===
              "biblioteca"
            }
            className={
              visualizacaoArquetipos ===
              "biblioteca"
                ? "ficha-nova-subnavegacao-botao ficha-nova-subnavegacao-botao-ativo"
                : "ficha-nova-subnavegacao-botao"
            }
            onClick={() =>
              setVisualizacaoArquetipos(
                "biblioteca"
              )
            }
          >
            BIBLIOTECA
          </button>

        </div>


        {visualizacaoArquetipos ===
        "adquiridos" ? (

          <>

            {arquetiposAdquiridos.length >
            0 ? (

              <>

                <div className="ficha-nova-arquetipos-area-topo">

                  <div>

                    <p className="ficha-nova-subtitulo-area ficha-nova-subtitulo-sem-margem">
                      ADQUIRIDOS
                    </p>

                    <span>
                      {arquetiposAdquiridos.length}
                      {" "}

                      {arquetiposAdquiridos.length ===
                      1
                        ? "Arquétipo registrado"
                        : "Arquétipos registrados"}
                    </span>

                  </div>


                  <div className="ficha-nova-arquetipos-destaque-info">

                    <span>
                      EM DESTAQUE
                    </span>

                    <strong>
                      {arquetipoAtual
                        ? `${arquetipoAtual.icone || "✦"} ${arquetipoAtual.nome}`
                        : "Nenhum"}
                    </strong>

                  </div>

                </div>


                <div className="ficha-nova-arquetipos-adquiridos-grid">

                  {arquetiposAdquiridos.map(
                    arquetipo => {
                      const destaque =
                        arquetipoAtual?.id ===
                        arquetipo.id;


                      return (
                        <article
                          key={
                            arquetipo.id
                          }
                          className={
                            destaque
                              ? "ficha-nova-arquetipo-adquirido ficha-nova-arquetipo-adquirido-destaque"
                              : "ficha-nova-arquetipo-adquirido"
                          }
                        >

                          <header>

                            <span className="ficha-nova-arquetipo-adquirido-icone">
                              {arquetipo.icone ||
                                "✦"}
                            </span>


                            <div>

                              <div className="ficha-nova-arquetipo-adquirido-selos">

                                <span>
                                  {nomeFamiliaArquetipo(
                                    arquetipo.familia
                                  )}
                                </span>


                                {destaque && (

                                  <strong>
                                    ★ EM DESTAQUE
                                  </strong>

                                )}


                                {arquetipo.incompleto && (

                                  <em>
                                    EM DESENVOLVIMENTO
                                  </em>

                                )}

                              </div>


                              <h3>
                                {arquetipo.nome}
                              </h3>

                            </div>

                          </header>


                          {arquetipo.frase && (

                            <blockquote>
                              “{arquetipo.frase}”
                            </blockquote>

                          )}


                          {arquetipo.passiva ? (

                            <div className="ficha-nova-passiva">

                              <span>
                                PASSIVA DO ARQUÉTIPO
                              </span>

                              <strong>
                                {arquetipo.passiva.nome}
                              </strong>

                              <p>
                                {arquetipo.passiva.descricao}
                              </p>

                            </div>

                          ) : (

                            <div className="ficha-nova-arquetipo-em-desenvolvimento">

                              <strong>
                                Regras ainda em desenvolvimento
                              </strong>

                              <p>
                                O Arquétipo pode ser adquirido normalmente. Quando suas regras forem cadastradas, esta ficha passará a exibi-las automaticamente.
                              </p>

                            </div>

                          )}


                          {arquetipo.adquiridoEmNivel !==
                          undefined &&
                          arquetipo.adquiridoEmNivel !==
                          null && (

                            <small className="ficha-nova-arquetipo-aquisicao">
                              Adquirido no nível{" "}
                              {arquetipo.adquiridoEmNivel}
                            </small>

                          )}


                          {!arquivada && (

                            <div className="ficha-nova-arquetipo-acoes">

                              {!destaque && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    definirArquetipoDestaque?.(
                                      arquetipo.id
                                    )
                                  }
                                >
                                  ★ DEFINIR DESTAQUE
                                </button>

                              )}


                              <button
                                type="button"
                                className="ficha-nova-arquetipo-remover"
                                onClick={() =>
                                  removerArquetipo?.(
                                    arquetipo.id
                                  )
                                }
                              >
                                REMOVER
                              </button>

                            </div>

                          )}

                        </article>
                      );
                    }
                  )}

                </div>

              </>

            ) : (

              <div className="ficha-nova-vazio">

                <span>
                  ✦
                </span>

                <h3>
                  Nenhum Arquétipo adquirido
                </h3>

                <p>
                  Acesse a Biblioteca para registrar o Arquétipo inicial ou uma nova aquisição da campanha.
                </p>

              </div>

            )}

          </>

        ) : (

          <section className="ficha-nova-arquetipo-biblioteca">

            <header className="ficha-nova-arquetipo-biblioteca-topo">

              <div>

                <p className="ficha-nova-etiqueta">
                  BIBLIOTECA DA CAMPANHA
                </p>

                <h3>
                  Arquétipos disponíveis
                </h3>

                <p>
                  Consulte o catálogo e registre novas aquisições quando a progressão ou a narrativa da campanha permitir.
                </p>

              </div>


              <div className="ficha-nova-biblioteca-contagem">

                <span>
                  BIBLIOTECA
                </span>

                <strong>
                  {arquetiposSuperOnze.length}
                  {" "}
                  arquétipos
                </strong>

              </div>

            </header>


            <div className="ficha-nova-arquetipo-filtros">

              {familias.map(
                familia => (

                  <button
                    key={
                      familia.id
                    }
                    type="button"
                    className={
                      filtroFamiliaArquetipo ===
                      familia.id
                        ? "ficha-nova-arquetipo-filtro ficha-nova-arquetipo-filtro-ativo"
                        : "ficha-nova-arquetipo-filtro"
                    }
                    onClick={() =>
                      setFiltroFamiliaArquetipo(
                        familia.id
                      )
                    }
                  >
                    {familia.nome}
                  </button>

                )
              )}

            </div>


            <ResumoBibliotecaAdquiridos
              itens={
                arquetiposAdquiridos
              }
              destaqueId={
                arquetipoAtual?.id ||
                null
              }
            />


            <div className="ficha-nova-arquetipo-biblioteca-grid">

              {arquetiposBiblioteca.map(
                arquetipo => {
                  const adquirido =
                    idsArquetiposAdquiridos.has(
                      arquetipo.id
                    );


                  return (
                    <article
                      key={
                        arquetipo.id
                      }
                      className={
                        adquirido
                          ? "ficha-nova-arquetipo-biblioteca-card ficha-nova-arquetipo-biblioteca-card-adquirido"
                          : "ficha-nova-arquetipo-biblioteca-card"
                      }
                    >

                      <header>

                        <span>
                          {arquetipo.icone ||
                            "✦"}
                        </span>


                        <div>

                          <small>
                            {nomeFamiliaArquetipo(
                              arquetipo.familia
                            )}
                          </small>

                          <h3>
                            {arquetipo.nome}
                          </h3>

                        </div>

                      </header>


                      {arquetipo.incompleto && (

                        <span className="ficha-nova-arquetipo-desenvolvimento-selo">
                          EM DESENVOLVIMENTO
                        </span>

                      )}


                      {arquetipo.frase && (

                        <blockquote>
                          “{arquetipo.frase}”
                        </blockquote>

                      )}


                      {arquetipo.passiva ? (

                        <div className="ficha-nova-arquetipo-biblioteca-passiva">

                          <span>
                            {arquetipo.passiva.nome}
                          </span>

                          <p>
                            {arquetipo.passiva.descricao}
                          </p>

                        </div>

                      ) : (

                        <p className="ficha-nova-arquetipo-biblioteca-pendente">
                          As regras completas deste Arquétipo ainda serão cadastradas. Isso não impede sua aquisição.
                        </p>

                      )}


                      <footer>

                        {adquirido ? (

                          <span className="ficha-nova-arquetipo-ja-adquirido">
                            ✓ ADQUIRIDO
                          </span>

                        ) : !arquivada ? (

                          <button
                            type="button"
                            onClick={() =>
                              adquirirArquetipo?.(
                                arquetipo.id
                              )
                            }
                          >
                            ＋ ADQUIRIR
                          </button>

                        ) : (

                          <span className="ficha-nova-arquetipo-ja-adquirido">
                            SOMENTE CONSULTA
                          </span>

                        )}

                      </footer>

                    </article>
                  );
                }
              )}

            </div>

          </section>

        )}

      </section>
    );
  }


  function Talentos() {
    const familias = [
      {
        id: "todos",
        nome: "Todos"
      },
      {
        id:
          FAMILIAS_TALENTO.OFENSIVO,
        nome: "Ofensivos"
      },
      {
        id:
          FAMILIAS_TALENTO.DEFENSIVO,
        nome: "Defensivos"
      },
      {
        id:
          FAMILIAS_TALENTO.MEIO_CAMPO,
        nome: "Meio-campo"
      },
      {
        id:
          FAMILIAS_TALENTO.GOLEIRO,
        nome: "Goleiros"
      }
    ];


    return (
      <section className="ficha-nova-modulo">

        <header className="ficha-nova-modulo-topo">

          <div>

            <p className="ficha-nova-etiqueta">
              PASSIVAS POSICIONAIS
            </p>

            <h2>
              Talentos Posicionais
            </h2>

            <p>
              A posição define uma afinidade de referência, mas não restringe quais Talentos o personagem pode adquirir.
            </p>

          </div>

        </header>


        <div
          className="ficha-nova-subnavegacao"
          role="tablist"
          aria-label="Visualização de Talentos"
        >

          <button
            type="button"
            role="tab"
            aria-selected={
              visualizacaoTalentos ===
              "adquiridos"
            }
            className={
              visualizacaoTalentos ===
              "adquiridos"
                ? "ficha-nova-subnavegacao-botao ficha-nova-subnavegacao-botao-ativo"
                : "ficha-nova-subnavegacao-botao"
            }
            onClick={() =>
              setVisualizacaoTalentos(
                "adquiridos"
              )
            }
          >
            ADQUIRIDOS

            <span>
              {talentosAdquiridos.length}
            </span>
          </button>


          <button
            type="button"
            role="tab"
            aria-selected={
              visualizacaoTalentos ===
              "biblioteca"
            }
            className={
              visualizacaoTalentos ===
              "biblioteca"
                ? "ficha-nova-subnavegacao-botao ficha-nova-subnavegacao-botao-ativo"
                : "ficha-nova-subnavegacao-botao"
            }
            onClick={() =>
              setVisualizacaoTalentos(
                "biblioteca"
              )
            }
          >
            BIBLIOTECA
          </button>

        </div>


        {visualizacaoTalentos ===
        "adquiridos" ? (

          <>

            {talentosAdquiridos.length >
            0 ? (

              <>

                <div className="ficha-nova-talentos-area-topo">

                  <div>

                    <p className="ficha-nova-subtitulo-area ficha-nova-subtitulo-sem-margem">
                      ADQUIRIDOS
                    </p>

                    <span>
                      {talentosAdquiridos.length}
                      {" "}

                      {talentosAdquiridos.length ===
                      1
                        ? "Talento registrado"
                        : "Talentos registrados"}
                    </span>

                  </div>

                </div>


                <div className="ficha-nova-talentos-adquiridos-grid">

                  {talentosAdquiridos.map(
                    talento => {
                      const editando =
                        edicaoTalento?.id ===
                        talento.id;


                      return (
                        <article
                          key={
                            talento.id
                          }
                          className="ficha-nova-talento-adquirido"
                        >

                          <header>

                            <span className="ficha-nova-talento-adquirido-icone">
                              {talento.icone ||
                                "🎯"}
                            </span>


                            <div>

                              <div className="ficha-nova-talento-adquirido-selos">

                                <span>
                                  {nomeFamilia(
                                    talento.familia
                                  )}
                                </span>

                                <strong>
                                  GRAU{" "}
                                  {talento.grau ||
                                    1}
                                </strong>

                              </div>


                              <h3>
                                {talento.nome}
                              </h3>

                            </div>

                          </header>


                          <p className="ficha-nova-talento-descricao">
                            {talento.descricao ||
                              "Sem descrição cadastrada."}
                          </p>


                          {talento.observacaoEvolucao && (

                            <div className="ficha-nova-talento-evolucao-registrada">

                              <span>
                                REGISTRO DA EVOLUÇÃO
                              </span>

                              <p>
                                {talento.observacaoEvolucao}
                              </p>

                            </div>

                          )}


                          {talento.adquiridoEmNivel !==
                          undefined &&
                          talento.adquiridoEmNivel !==
                          null && (

                            <small className="ficha-nova-talento-aquisicao">
                              Adquirido no nível{" "}
                              {talento.adquiridoEmNivel}
                            </small>

                          )}


                          {editando ? (

                            <div className="ficha-nova-talento-edicao">

                              <label>

                                <span>
                                  GRAU ATUAL
                                </span>

                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    edicaoTalento.grau
                                  }
                                  onChange={
                                    evento =>
                                      alterarCampoEdicaoTalento(
                                        "grau",
                                        evento
                                          .target
                                          .value
                                      )
                                  }
                                />

                              </label>


                              <label>

                                <span>
                                  O QUE MUDOU / FOI GANHO
                                </span>

                                <textarea
                                  rows="4"
                                  placeholder="Opcional. Ex.: o bônus passou de +5 para +10 em testes acrobáticos."
                                  value={
                                    edicaoTalento
                                      .observacaoEvolucao
                                  }
                                  onChange={
                                    evento =>
                                      alterarCampoEdicaoTalento(
                                        "observacaoEvolucao",
                                        evento
                                          .target
                                          .value
                                      )
                                  }
                                />

                              </label>


                              <p>
                                O Grau é um registro manual. O sistema não aplica bônus ou regras automaticamente.
                              </p>


                              <div className="ficha-nova-talento-edicao-acoes">

                                <button
                                  type="button"
                                  onClick={() =>
                                    setEdicaoTalento(
                                      null
                                    )
                                  }
                                >
                                  CANCELAR
                                </button>


                                <button
                                  type="button"
                                  className="ficha-nova-talento-salvar"
                                  onClick={
                                    salvarEdicaoTalento
                                  }
                                >
                                  ✓ SALVAR
                                </button>

                              </div>

                            </div>

                          ) : !arquivada ? (

                            <div className="ficha-nova-talento-acoes">

                              <button
                                type="button"
                                onClick={() =>
                                  abrirEdicaoTalento(
                                    talento
                                  )
                                }
                              >
                                ↗ EDITAR EVOLUÇÃO
                              </button>


                              <button
                                type="button"
                                className="ficha-nova-talento-remover"
                                onClick={() =>
                                  removerTalentoPosicional?.(
                                    talento.id
                                  )
                                }
                              >
                                REMOVER
                              </button>

                            </div>

                          ) : null}

                        </article>
                      );
                    }
                  )}

                </div>

              </>

            ) : (

              <div className="ficha-nova-vazio ficha-nova-vazio-talentos">

                <span>
                  🎯
                </span>

                <h3>
                  Nenhum talento adquirido
                </h3>

                <p>
                  Esta ficha pode começar sem Talentos. Quando houver uma aquisição, use a Biblioteca para adicioná-la.
                </p>

              </div>

            )}

          </>

        ) : (

          <section className="ficha-nova-talento-biblioteca">

            <header className="ficha-nova-talento-biblioteca-topo">

              <div>

                <p className="ficha-nova-etiqueta">
                  BIBLIOTECA DA CAMPANHA
                </p>

                <h3>
                  Talentos disponíveis
                </h3>

                <p>
                  Consulte todas as famílias. A afinidade da posição aparece apenas como referência e nunca bloqueia outras escolhas.
                </p>

              </div>


              <div className="ficha-nova-biblioteca-contagem">

                <span>
                  BIBLIOTECA
                </span>

                <strong>
                  {todosTalentos.length}
                  {" "}
                  talentos
                </strong>

              </div>

            </header>


            <div className="ficha-nova-talento-filtros">

              {familias.map(
                familia => (

                  <button
                    key={
                      familia.id
                    }
                    type="button"
                    className={
                      filtroFamiliaTalento ===
                      familia.id
                        ? "ficha-nova-talento-filtro ficha-nova-talento-filtro-ativo"
                        : "ficha-nova-talento-filtro"
                    }
                    onClick={() =>
                      setFiltroFamiliaTalento(
                        familia.id
                      )
                    }
                  >
                    {familia.nome}

                    {familia.id ===
                    familiaAfinidade &&
                    familia.id !==
                    "todos"
                      ? " · AFINIDADE"
                      : ""}
                  </button>

                )
              )}

            </div>


            <ResumoBibliotecaAdquiridos
              itens={
                talentosAdquiridos
              }
            />


            <div className="ficha-nova-talento-biblioteca-grid">

              {talentosBiblioteca.map(
                talento => {
                  const adquirido =
                    idsTalentosAdquiridos.has(
                      talento.id
                    );


                  const afinidade =
                    talento.familia ===
                    familiaAfinidade;


                  return (
                    <article
                      key={
                        talento.id
                      }
                      className={
                        adquirido
                          ? "ficha-nova-talento-biblioteca-card ficha-nova-talento-biblioteca-card-adquirido"
                          : "ficha-nova-talento-biblioteca-card"
                      }
                    >

                      <header>

                        <span>
                          {talento.icone ||
                            "🎯"}
                        </span>


                        <div>

                          <div className="ficha-nova-talento-biblioteca-selos">

                            <small>
                              {nomeFamilia(
                                talento.familia
                              )}
                            </small>


                            {afinidade && (

                              <em>
                                AFINIDADE
                              </em>

                            )}

                          </div>


                          <h3>
                            {talento.nome}
                          </h3>

                        </div>

                      </header>


                      <p>
                        {talento.descricao ||
                          "Sem descrição cadastrada."}
                      </p>


                      <footer>

                        {adquirido ? (

                          <span className="ficha-nova-talento-ja-adquirido">
                            ✓ ADQUIRIDO
                          </span>

                        ) : !arquivada ? (

                          <button
                            type="button"
                            onClick={() =>
                              adquirirTalentoPosicional?.(
                                talento.id
                              )
                            }
                          >
                            ＋ ADQUIRIR
                          </button>

                        ) : (

                          <span className="ficha-nova-talento-ja-adquirido">
                            SOMENTE CONSULTA
                          </span>

                        )}

                      </footer>

                    </article>
                  );
                }
              )}

            </div>

          </section>

        )}

      </section>
    );
  }


  function Ritmo() {
    const ritmos = [
      {
        chave: "individual",
        nome: "Ritmo Individual",
        descricao:
          "Fluxo pessoal do personagem durante a partida.",
        ...ritmoIndividual
      },
      {
        chave: "equipe",
        nome: "Ritmo da Equipe",
        descricao:
          "Fluxo coletivo compartilhado pela equipe.",
        ...ritmoEquipe
      }
    ];


    return (
      <section className="ficha-nova-modulo">

        <header className="ficha-nova-modulo-topo">

          <div>

            <p className="ficha-nova-etiqueta">
              FLUXO DE JOGO
            </p>

            <h2>
              Ritmo & Momentum
            </h2>

            <p>
              Os dois sistemas ficam juntos por importância durante a partida, mas continuam claramente separados.
            </p>

          </div>

        </header>


        <section className="ficha-nova-ritmo-secao">

          <header className="ficha-nova-ritmo-secao-topo">

            <div>

              <p className="ficha-nova-etiqueta">
                RITMO
              </p>

              <h3>
                Fluxo da partida
              </h3>

              <p>
                Ritmo é registrado em pontos e pode variar com maior frequência.
              </p>

            </div>

          </header>


          <div className="ficha-nova-ritmo-grid">

            {ritmos.map(
              ritmo => {
                const percentual =
                  porcentagem(
                    ritmo.atual,
                    ritmo.maximo
                  );


                return (
                  <article
                    key={
                      ritmo.chave
                    }
                    className="ficha-nova-painel ficha-nova-ritmo-card"
                  >

                    <span>
                      ♫ {ritmo.nome.toUpperCase()}
                    </span>

                    <strong>
                      {ritmo.atual}
                      {" / "}
                      {ritmo.maximo}
                    </strong>

                    <p>
                      {ritmo.descricao}
                    </p>


                    <div className="ficha-nova-barra">

                      <div
                        className="ficha-nova-barra-preenchimento"
                        style={{
                          width:
                            `${percentual}%`
                        }}
                      />

                    </div>


                    {!arquivada && (

                      <div className="ficha-nova-ritmo-controles">

                        {[
                          -10,
                          -1,
                          1,
                          10
                        ].map(
                          quantidade => (

                            <button
                              key={
                                quantidade
                              }
                              type="button"
                              onClick={() =>
                                alterarRitmoRapido(
                                  ritmo.chave,
                                  quantidade
                                )
                              }
                            >
                              {quantidade >
                              0
                                ? "+"
                                : ""}

                              {quantidade}
                            </button>

                          )
                        )}

                      </div>

                    )}

                  </article>
                );
              }
            )}

          </div>

        </section>


        <section className="ficha-nova-momentum-secao">

          <div className="ficha-nova-momentum-icone">
            🔥
          </div>


          <div className="ficha-nova-momentum-conteudo">

            <p className="ficha-nova-etiqueta">
              MOMENTUM
            </p>

            <h3>
              Recurso especial
            </h3>

            <p>
              Momentum é numérico, raro e separado do Ritmo. Ele pode ser utilizado em ações especiais e tende a ser mais difícil de recuperar.
            </p>


            <div className="ficha-nova-momentum-valor">

              <strong>
                {momentumAtual}
              </strong>


              {momentumMaximo >
              0 && (

                <span>
                  / {momentumMaximo}
                </span>

              )}

            </div>


            {momentumMaximo >
            0 && (

              <div className="ficha-nova-barra ficha-nova-barra-grande">

                <div
                  className="ficha-nova-barra-preenchimento ficha-nova-barra-momentum"
                  style={{
                    width:
                      `${porcentagem(
                        momentumAtual,
                        momentumMaximo
                      )}%`
                  }}
                />

              </div>

            )}


            {!arquivada && (

              <div className="ficha-nova-momentum-controles">

                {[
                  -5,
                  -1,
                  1,
                  5
                ].map(
                  quantidade => (

                    <button
                      key={
                        quantidade
                      }
                      type="button"
                      onClick={() =>
                        alterarMomentum?.(
                          quantidade
                        )
                      }
                    >
                      {quantidade >
                      0
                        ? "+"
                        : ""}

                      {quantidade}
                    </button>

                  )
                )}


                <label>

                  <span>
                    DEFINIR
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      momentumAtual
                    }
                    onChange={
                      evento =>
                        definirMomentum?.(
                          evento
                            .target
                            .value
                        )
                    }
                  />

                </label>

              </div>

            )}

          </div>

        </section>

      </section>
    );
  }


  function Condicoes() {
    return (
      <section className="ficha-nova-modulo">

        <header className="ficha-nova-modulo-topo">

          <div>

            <p className="ficha-nova-etiqueta">
              CONDIÇÃO ATUAL
            </p>

            <h2>
              Condições
            </h2>

            <p>
              Estado físico e mental ficam separados de Ritmo e Momentum. Aqui podem ser registrados ferimentos, exaustão, pressão psicológica e outros estados.
            </p>

          </div>


          {!arquivada && (

            <button
              type="button"
              className={
                editandoCondicoes
                  ? "ficha-nova-botao-principal"
                  : "ficha-nova-botao-secundario"
              }
              onClick={() =>
                setEditandoCondicoes(
                  anterior =>
                    !anterior
                )
              }
            >
              {editandoCondicoes
                ? "✓ CONCLUIR"
                : "✏ ALTERAR CONDIÇÕES"}
            </button>

          )}

        </header>


        <div className="ficha-nova-condicoes-grid">

          <article
            className={
              condicaoFisicaNormal(
                estadoFisico
              )
                ? "ficha-nova-condicao-card"
                : "ficha-nova-condicao-card ficha-nova-condicao-card-alerta"
            }
          >

            <div className="ficha-nova-condicao-icone">
              💪
            </div>


            <div>

              <p className="ficha-nova-etiqueta">
                FÍSICO
              </p>


              {!editandoCondicoes ? (

                <h3>
                  {estadoFisico}
                </h3>

              ) : (

                <>

                  <input
                    type="text"
                    list="sugestoes-fisicas"
                    value={
                      estadoFisico
                    }
                    onChange={
                      evento =>
                        definirEstado?.(
                          "fisico",
                          evento
                            .target
                            .value
                        )
                    }
                  />


                  <datalist id="sugestoes-fisicas">
                    <option value="Normal" />
                    <option value="Lesionado" />
                    <option value="Ferido" />
                    <option value="Exausto" />
                    <option value="Debilitado" />
                    <option value="Doente" />
                  </datalist>

                </>

              )}


              <p>
                Registra a condição corporal atual. O texto é livre para que outras campanhas também possam usar este módulo.
              </p>

            </div>

          </article>


          <article
            className={
              condicaoMentalNormal(
                estadoMental
              )
                ? "ficha-nova-condicao-card"
                : "ficha-nova-condicao-card ficha-nova-condicao-card-alerta"
            }
          >

            <div className="ficha-nova-condicao-icone">
              🧠
            </div>


            <div>

              <p className="ficha-nova-etiqueta">
                MENTAL
              </p>


              {!editandoCondicoes ? (

                <h3>
                  {estadoMental}
                </h3>

              ) : (

                <>

                  <input
                    type="text"
                    list="sugestoes-mentais"
                    value={
                      estadoMental
                    }
                    onChange={
                      evento =>
                        definirEstado?.(
                          "mental",
                          evento
                            .target
                            .value
                        )
                    }
                  />


                  <datalist id="sugestoes-mentais">
                    <option value="Estável" />
                    <option value="Focado" />
                    <option value="Abalado" />
                    <option value="Ansioso" />
                    <option value="Assustado" />
                    <option value="Desmotivado" />
                  </datalist>

                </>

              )}


              <p>
                Registra concentração, pressão, medo, estabilidade emocional e outras condições psicológicas.
              </p>

            </div>

          </article>

        </div>


        <div className="ficha-nova-aviso">

          <span>
            ℹ️
          </span>

          <p>
            Quando uma condição deixa de ser normal, ela também ganha destaque no Resumo para que o jogador não esqueça algo importante durante a sessão.
          </p>

        </div>

      </section>
    );
  }


  function Administracao() {
    return (
      <section className="ficha-nova-modulo">

        <header className="ficha-nova-modulo-topo">

          <div>

            <p className="ficha-nova-etiqueta">
              GERENCIAMENTO
            </p>

            <h2>
              Administração
            </h2>

            <p>
              Identidade, propriedade, visibilidade e organização da entidade.
            </p>

          </div>

        </header>


        <div className="ficha-nova-admin-grid">

          <article className="ficha-nova-painel ficha-nova-admin-principal">

            <div className="ficha-nova-admin-identidade">

              <span>
                {iconeTipo(
                  tipoEntidade
                )}
              </span>


              <div>

                <small>
                  CLASSIFICAÇÃO
                </small>

                <h3>
                  {formatarNomeTipo(
                    tipoEntidade
                  )}
                </h3>

              </div>

            </div>


            <div className="ficha-nova-admin-dados">

              <div>
                <span>Nome</span>

                <strong>
                  {ficha.nome}
                </strong>
              </div>


              <div>
                <span>
                  Proprietário
                </span>

                <strong>
                  {nomeProprietario(
                    ficha
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Visibilidade
                </span>

                <strong>
                  {formatarVisibilidade(
                    ficha.visibilidade
                  )}
                </strong>
              </div>


              <div>
                <span>Estado</span>

                <strong>
                  {arquivada
                    ? "📦 Arquivada"
                    : "● Ativa"}
                </strong>
              </div>

            </div>


            {!arquivada && (

              <button
                type="button"
                className="ficha-nova-botao-principal ficha-nova-botao-largo"
                onClick={
                  onEditarPersonagem
                }
              >
                ✏ EDITAR IDENTIDADE
              </button>

            )}

          </article>


          <article className="ficha-nova-painel ficha-nova-admin-organizacao">

            <p className="ficha-nova-etiqueta">
              ORGANIZAÇÃO
            </p>

            <h3>
              Cada dado no seu módulo
            </h3>

            <p className="ficha-nova-texto-secundario">
              Administração não altera atributos, recursos, progressão, Ritmo ou condições diretamente.
            </p>


            <div className="ficha-nova-admin-atalhos">

              <button
                type="button"
                onClick={() =>
                  trocarModulo(
                    "atributos"
                  )
                }
              >
                🛡️ Atributos
                <span>→</span>
              </button>


              <button
                type="button"
                onClick={() =>
                  trocarModulo(
                    "recursos"
                  )
                }
              >
                ◆ Recursos
                <span>→</span>
              </button>


              <button
                type="button"
                onClick={() =>
                  trocarModulo(
                    "arquetipo"
                  )
                }
              >
                ✦ Arquétipos
                <span>→</span>
              </button>


              <button
                type="button"
                onClick={() =>
                  trocarModulo(
                    "talentos"
                  )
                }
              >
                🎯 Talentos
                <span>→</span>
              </button>


              <button
                type="button"
                onClick={() =>
                  trocarModulo(
                    "ritmo"
                  )
                }
              >
                ♫ Ritmo & Momentum
                <span>→</span>
              </button>


              <button
                type="button"
                onClick={() =>
                  trocarModulo(
                    "condicoes"
                  )
                }
              >
                ✚ Condições
                <span>→</span>
              </button>


              <button
                type="button"
                onClick={() =>
                  trocarModulo(
                    "habilidades"
                  )
                }
              >
                ⚡ Habilidades
                <span>→</span>
              </button>

            </div>

          </article>

        </div>

      </section>
    );
  }


  function ConteudoModulo() {
    if (
      moduloAtivo ===
      "resumo"
    ) {
      return <Resumo />;
    }


    if (
      moduloAtivo ===
      "habilidades"
    ) {
      return <Habilidades />;
    }


    if (
      moduloAtivo ===
      "atributos"
    ) {
      return <Atributos />;
    }


    if (
      moduloAtivo ===
      "recursos"
    ) {
      return <Recursos />;
    }


    if (
      moduloAtivo ===
      "arquetipo"
    ) {
      return <Arquetipo />;
    }


    if (
      moduloAtivo ===
      "talentos"
    ) {
      return <Talentos />;
    }


    if (
      moduloAtivo ===
      "ritmo"
    ) {
      return <Ritmo />;
    }


    if (
      moduloAtivo ===
      "condicoes"
    ) {
      return <Condicoes />;
    }


    if (
      moduloAtivo ===
      "vinculos"
    ) {
      return <VinculosModulo ficha={ficha} entidades={entidadesCampanha} podeEditar={podeEditarDados} onSalvar={onSalvarModulo} />;
    }


    if (
      moduloAtivo ===
      "evolucao"
    ) {
      return <EvolucaoModulo ficha={ficha} podeEditar={podeEditarDados} onSalvar={onSalvarModulo} />;
    }


    if (
      moduloAtivo ===
      "inventario"
    ) {
      return <InventarioModulo ficha={ficha} podeEditar={podeEditarDados} onSalvar={onSalvarModulo} />;
    }


    if (
      moduloAtivo ===
      "administracao"
    ) {
      return <Administracao />;
    }


    return <Resumo />;
  }


  return (
    <div className="ficha-nova">

      <header className="ficha-nova-topo">

        <button
          type="button"
          className="ficha-nova-voltar"
          onClick={
            onVoltar
          }
        >
          ←
        </button>


        <div className="ficha-nova-topo-avatar">

          {ficha.imagem ? (

            <img
              src={
                ficha.imagem
              }
              alt={
                ficha.nome
              }
            />

          ) : (

            <span>
              {iconeTipo(
                tipoEntidade
              )}
            </span>

          )}

        </div>


        <div className="ficha-nova-topo-info">

          <div className="ficha-nova-topo-titulo">

            <h1>
              {ficha.nome}
            </h1>


            <span className="ficha-nova-tipo">
              {iconeTipo(
                tipoEntidade
              )}{" "}
              {formatarNomeTipo(
                tipoEntidade
              )}
            </span>


            {arquivada && (

              <span className="ficha-nova-arquivada">
                📦 ARQUIVADA
              </span>

            )}

          </div>


          <p>
            {valorInformacao(
              informacoes.posicao
            )}

            {" • "}

            Nível{" "}
            {informacoes.nivel}
          </p>

        </div>

      </header>


      <div className="ficha-nova-layout">

        <aside className="ficha-nova-menu">

          <p className="ficha-nova-menu-titulo">
            FICHA
          </p>


          <nav>

            {MODULOS.map(
              modulo => (

                <button
                  key={
                    modulo.id
                  }
                  type="button"
                  className={
                    moduloAtivo ===
                    modulo.id
                      ? "ficha-nova-menu-item ficha-nova-menu-item-ativo"
                      : "ficha-nova-menu-item"
                  }
                  onClick={() =>
                    trocarModulo(
                      modulo.id
                    )
                  }
                >

                  <span>
                    {modulo.icone}
                  </span>

                  {modulo.nome}

                </button>

              )
            )}

          </nav>


          <div className="ficha-nova-menu-separador" />


          <button
            type="button"
            className={
              moduloAtivo ===
              "administracao"
                ? "ficha-nova-menu-item ficha-nova-menu-item-ativo"
                : "ficha-nova-menu-item"
            }
            onClick={() =>
              trocarModulo(
                "administracao"
              )
            }
          >

            <span>
              ⚙
            </span>

            Administração

          </button>

        </aside>


        <main className="ficha-nova-conteudo">
          <ConteudoModulo />
        </main>

      </div>

    </div>
  );
}


export default FichaDetalhes;
