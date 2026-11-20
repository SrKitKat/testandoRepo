import { useEffect, useRef, useState } from "react";
import { getRememberSession, setRememberSession, supabase } from "../../lib/supabase.js";
import AuthEnergy from "./AuthEnergy.jsx";
import arenaBackground from "./arena-background.webp";
import "./AuthScreen.css";

const icons = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  lock: "M7 11V7a5 5 0 0 1 10 0v4M6 11h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm6 4v3",
  eye: "M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  hidden: "M3 3l18 18M10 6c.7-.1 1.4 0 2 0 6 0 10 6 10 6a19 19 0 0 1-3 3M6 7.5A18 18 0 0 0 2 12s4 6 10 6c1.4 0 2.7-.3 3.8-.8",
  bolt: "M13.6 1 3 14h7l-1.6 9L21 9h-8l.6-8Z",
};

function Icon({ name }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill={name === "bolt" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={icons[name]} /></svg>;
}

export default function AuthScreen({ configurado }) {
  const [modo, setModo] = useState("entrar");
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(getRememberSession);
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [descarga, setDescarga] = useState(0);
  const [visivel, setVisivel] = useState(!document.hidden);
  const recuperacao = useRef(null);
  const usuario = useRef(null);
  const senhaCampo = useRef(null);
  const confirmacao = useRef(null);
  const criando = modo === "criar";

  useEffect(() => {
    const atualizar = () => setVisivel(!document.hidden);
    document.addEventListener("visibilitychange", atualizar);
    return () => document.removeEventListener("visibilitychange", atualizar);
  }, []);

  function erroCampo(campo, texto, ref) {
    setMensagem({ campo, texto });
    ref.current.focus();
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setMensagem(null);
    const nome = username.trim();
    if (!/^[a-zA-Z0-9_.]{3,32}$/.test(nome)) {
      erroCampo("usuario", "Use de 3 a 32 caracteres: letras, números, ponto ou underscore.", usuario);
      return;
    }
    if (senha.length < 8) {
      erroCampo("senha", "A senha deve ter pelo menos 8 caracteres.", senhaCampo);
      return;
    }
    if (criando && senha !== confirmarSenha) {
      erroCampo("confirmacao", "As senhas não coincidem.", confirmacao);
      return;
    }

    setDescarga(value => value + 1);
    setEnviando(true);
    try {
      if (!configurado || !supabase) {
        setMensagem({ texto: "Formulário validado no modo demonstração.", sucesso: true });
        return;
      }
      const funcao = criando ? "register-username" : "login-username";
      const { data, error } = await supabase.functions.invoke(funcao, { body: { username: nome, password: senha } });
      if (data?.code === "USERNAME_TAKEN") {
        erroCampo("usuario", "Este nome de usuário já está em uso.", usuario);
        return;
      }
      if (error || !data?.session) throw new Error("Sessão ausente");
      setRememberSession(lembrar);
      const { error: erroSessao } = await supabase.auth.setSession(data.session);
      if (erroSessao) throw erroSessao;
      setMensagem({ texto: "Acesso confirmado!", sucesso: true });
    } catch {
      setMensagem({ texto: criando
        ? "Não foi possível criar a conta. Tente novamente em instantes."
        : "Ops! Parece que você perdeu a bola. Confira seus dados!" });
    } finally {
      setEnviando(false);
    }
  }

  const atributoCampo = (campo) => ({
    "aria-invalid": mensagem?.campo === campo || undefined,
    "aria-describedby": mensagem?.campo === campo ? "arena-feedback" : undefined,
  });

  function trocarModo() {
    setModo(criando ? "entrar" : "criar");
    setMensagem(null);
    setConfirmarSenha("");
    setMostrarSenha(false);
    usuario.current.focus();
  }

  return <main className="arena-login" data-paused={!visivel || undefined}>
    <div className="arena-scene" style={{ "--arena-background": "url(" + arenaBackground + ")" }} aria-hidden="true" />
    <div className="arena-shade" aria-hidden="true" />
    <AuthEnergy />
    <div className="arena-content">
      <h1 className="arena-logo">
        <span>RPG Manager</span>
        <svg className="arena-logo-lightning" viewBox="0 0 300 86" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 54l30-10 16 4 21-13 18 7 24-10 16 4 28-12 14 6 31-11 19 6 25-14 16 5 37-13M67 35l-5-10-17-6m108 5 10-11 15-3m64 1 6 13 15 4" />
          <path d="M6 78l33-13 13 7 34-11 15 5 28-13 19 6 32-15 14 5 25-9 19 6 34-14 24 4m-195 30 10 8 13-1m96-43 8-11 14 1" />
        </svg>
      </h1>
      <section className="arena-panel" aria-labelledby="arena-heading">
        <div className="arena-panel-frame" aria-hidden="true" />
        <div className="arena-panel-face" aria-hidden="true" />
        <svg className="arena-panel-arcs" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M5 25V10L10 1H27l4 1 7-1M5 13l4-3 1-5M68 4h13l4 3h14v18m0-13-4-3-5 1" />
          <path d="M99 73v14l-12 12H68m23-4-4 1-6-4M2 77v19h19l4-1 13 1M2 92l5-2 5 1" />
        </svg>
        {descarga > 0 && <div key={descarga} className="arena-discharge" aria-hidden="true" />}
        <h2 id="arena-heading"><Icon name="bolt" /> {criando ? "Criar conta" : "Login"}</h2>
        {!configurado && <p className="arena-demo">Modo demonstração</p>}
        <form className="arena-form" onSubmit={enviar} noValidate aria-busy={enviando}>
          <label className="arena-field">
            <span className="arena-sr">Usuário</span><Icon name="user" />
            <input ref={usuario} autoComplete="username" placeholder="Usuário" value={username} required
              readOnly={enviando} onChange={e => { setUsername(e.target.value); setMensagem(null); }} {...atributoCampo("usuario")} />
          </label>
          <div className="arena-field">
            <label className="arena-sr" htmlFor="arena-password">Senha</label><Icon name="lock" />
            <input ref={senhaCampo} id="arena-password" autoComplete={criando ? "new-password" : "current-password"} placeholder="Senha"
              type={mostrarSenha ? "text" : "password"} value={senha} required disabled={enviando}
              onChange={e => { setSenha(e.target.value); setMensagem(null); }} {...atributoCampo("senha")} />
            <button type="button" className="arena-eye" aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setMostrarSenha(value => !value)}><Icon name={mostrarSenha ? "hidden" : "eye"} /></button>
          </div>
          {criando && <label className="arena-field">
            <span className="arena-sr">Confirmar senha</span><Icon name="lock" />
            <input ref={confirmacao} autoComplete="new-password" placeholder="Confirmar senha" type={mostrarSenha ? "text" : "password"}
              value={confirmarSenha} required disabled={enviando} onChange={e => { setConfirmarSenha(e.target.value); setMensagem(null); }}
              {...atributoCampo("confirmacao")} />
          </label>}
          <div className="arena-options">
            <label><input type="checkbox" checked={lembrar} disabled={enviando} onChange={e => setLembrar(e.target.checked)} />Lembrar-me</label>
            {!criando && <button className="arena-link" type="button" onClick={() => recuperacao.current.showModal()}>Esqueci minha senha</button>}
          </div>
          <button className="arena-submit" type="submit" disabled={enviando}>
            <span>{enviando ? (criando ? "Criando conta…" : "Entrando…") : (criando ? "Criar conta" : "Entrar")}</span>
            <Icon name="bolt" />
          </button>
          {mensagem && <p id="arena-feedback" className="arena-feedback" role={mensagem.sucesso ? "status" : "alert"} data-success={mensagem.sucesso || undefined}>{mensagem.texto}</p>}
        </form>
        <p className="arena-switch">{criando ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
          <button className="arena-link" type="button" disabled={enviando} onClick={trocarModo}>{criando ? "Entrar" : "Cadastre-se!"}</button>
        </p>
      </section>
    </div>
    <dialog className="arena-recovery" ref={recuperacao} aria-labelledby="arena-recovery-title">
      <h2 id="arena-recovery-title">Recuperar senha</h2>
      <p>As contas deste RPG usam apenas nome de usuário. A recuperação automática depende de um canal verificado, que ainda não está disponível.</p>
      <form method="dialog"><button className="arena-link">Voltar ao login</button></form>
    </dialog>
  </main>;
}
