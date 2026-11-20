import { useState } from "react";
import "../auth/AuthScreen.css";
import { ManagerIcon } from "../../app/ManagerLayout.jsx";

export default function PrimeiroAcesso({ nome, onCriar, onEntrar, dentroDaLista = false }) {
  const [acao, setAcao] = useState(null);
  const [valor, setValor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const criando = acao === "criar";
  const Shell = dentroDaLista ? "div" : "main";
  const Heading = dentroDaLista ? "h2" : "h1";

  function escolher(proxima) {
    setAcao(proxima);
    setValor("");
    setMensagem("");
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando || !valor.trim()) return;
    setEnviando(true);
    setMensagem("");
    try {
      if (criando) await onCriar(valor.trim());
      else await onEntrar(valor.trim().toUpperCase());
    } catch {
      setMensagem(criando ? "Não foi possível criar a campanha." : "Código de convite inválido ou indisponível.");
    } finally {
      setEnviando(false);
    }
  }

  return <Shell className={dentroDaLista ? undefined : "manager-home"}>
    <section className="manager-energy-card manager-campaign-form">
      <Heading className="manager-section-title"><ManagerIcon name="flag" />{dentroDaLista ? "Adicionar campanha" : "Olá, " + nome + "."}</Heading>
      {!dentroDaLista && <p>Você ainda não participa de nenhuma campanha.</p>}
      {acao ? <form onSubmit={enviar} aria-busy={enviando}>
        <label>{criando ? "Nome da campanha" : "Código de convite"}
          <input value={valor} onChange={e => setValor(e.target.value)} required maxLength={120} autoFocus />
        </label>
        <div className="manager-form-actions">
          <button className="manager-primary" type="submit" disabled={enviando}>
            {enviando ? "Aguarde…" : criando ? "Criar como Mestre" : "Entrar como Jogador"}
          </button>
          <button className="manager-secondary" type="button" disabled={enviando} onClick={() => escolher(null)}>Voltar</button>
        </div>
      </form> : <div className="manager-form-actions">
        <button className="manager-primary" type="button" onClick={() => escolher("criar")}>Criar campanha</button>
        <button className="manager-secondary" type="button" onClick={() => escolher("entrar")}>Entrar em campanha</button>
      </div>}
      {mensagem && <p role="alert">{mensagem}</p>}
    </section>
  </Shell>;
}
