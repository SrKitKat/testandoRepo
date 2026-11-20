import { PAPEIS_CAMPANHA } from "./campanhas.js";
import { EnergyCard, ManagerIcon } from "../../app/ManagerLayout.jsx";
import PrimeiroAcesso from "./PrimeiroAcesso.jsx";

export default function MinhasCampanhas({ campanhas, atualId, onEntrar, onCriar, onConvidado }) {
  return <main className="manager-home manager-campaigns">
    <EnergyCard>
      <h1 className="manager-section-title"><ManagerIcon name="flag" />Minhas campanhas</h1>
      <div className="manager-campaign-grid">
        {campanhas.map(campanha => {
          const mestre = campanha.acesso?.papel === PAPEIS_CAMPANHA.MESTRE;
          return <article className="manager-campaign-option" key={campanha.id}>
            <div className="manager-current-art" aria-hidden="true" />
            <span className="manager-role">{mestre ? "Mestre" : "Jogador"}</span>
            <h2>{campanha.nome}</h2>
            {campanha.descricao && <p>{campanha.descricao}</p>}
            {mestre && campanha.inviteCode && <p>Código de convite <code>{campanha.inviteCode}</code></p>}
            <button type="button" className="manager-primary" onClick={() => onEntrar(campanha.id)}>
              {campanha.id === atualId ? "Voltar à campanha atual" : "Selecionar campanha"}
              <ManagerIcon name="arrow" />
            </button>
          </article>;
        })}
      </div>
    </EnergyCard>
    <PrimeiroAcesso dentroDaLista onCriar={onCriar} onEntrar={onConvidado} />
  </main>;
}
