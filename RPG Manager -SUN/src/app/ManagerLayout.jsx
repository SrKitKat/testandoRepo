import { useEffect, useRef, useState } from "react";
import academy from "./assets/academy.webp";
import arena from "../features/auth/arena-background.webp";
import "./ManagerLayout.css";

const paths = {
  home: "m3 10 9-7 9 7v10h-6v-6H9v6H3z",
  flag: "M5 21V4m0 1c5-4 8 4 14 0v10c-6 4-9-4-14 0",
  people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4-4a4 4 0 0 1 0 8",
  card: "M5 3h14v18H5zM8 8h8m-8 4h8m-8 4h5",
  bolt: "m13 2-9 12h7l-1 8 10-12h-7l1-8Z",
  bag: "M5 8h14l2 12H3L5 8Zm4 0V6a3 3 0 0 1 6 0v2m-6 5 6 3m0-3-6 3",
  note: "M12 4H4v16h16v-8m-2-9 3 3-9 9H9v-3l9-9Z",
  gear: "M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z",
  map: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15",
  heart: "M12 21 3.8 13a5 5 0 0 1 7-7l1.2 1.2L13.2 6a5 5 0 0 1 7 7Z",
  arrow: "M4 12h16m-6-6 6 6-6 6",
};

export function ManagerIcon({ name }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill={name === "bolt" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

function Football() {
  return <svg className="manager-ball" aria-hidden="true" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="29" fill="#e7f7ff" stroke="#63c9ff" strokeWidth="3" />
    <path d="m32 20 11 8-4 13H25l-4-13 11-8ZM31 4l10 7-5 9-10 1-6-10Zm28 20-8 1-6 7 4 10 9 1 4-10ZM7 23l9 3 4 8-7 9-8-1-3-9Zm16 25-3 10 12 4 11-4-3-10Z" fill="#09223f" />
    <path d="m20 11-4 15m20-6 15 5m-2 17-9 6m-17 0-10-5" fill="none" stroke="#547795" strokeWidth="1.5" />
  </svg>;
}

export function ManagerLoading({ children }) {
  return <section className="manager-loading" role="status">
    <span className="manager-ball-halo"><Football /></span>
    <p>{children}</p>
  </section>;
}

const navigation = [
  ["inicio", "Início", "home"], ["campanhas", "Campanhas", "flag"],
  ["personagens", "Personagens", "people"], ["fichas", "Fichas", "card"],
  ["habilidades", "Habilidades", "bolt"], ["inventario", "Itens", "bag"],
  ["anotacoes", "Anotações", "note"], ["equipe", "Equipe", "people"],
  ["configuracoes", "Configurações", "gear"],
];

const art = { "--manager-art": "url(" + arena + ")", "--manager-school": "url(" + academy + ")" };

const sidebarPreference = "rpg-manager:sidebar-pinned";

export function ManagerLayout({ children, active, navigate, user, role, hasCampaign, canConfigure, onLogout, pageKey }) {
  const [menu, setMenu] = useState(false);
  const [pinned, setPinned] = useState(() => localStorage.getItem(sidebarPreference) === "true");
  const [hidden, setHidden] = useState(document.hidden);
  const menuButton = useRef(null);
  const menuLinks = useRef(null);
  const avatar = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.display_name || user.user_metadata?.username || "Jogador";

  useEffect(() => {
    function sync() { setHidden(document.hidden); }
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (menu) menuLinks.current?.querySelector('[aria-current="page"], button')?.focus();
  }, [menu]);

  function closeMenu() {
    setMenu(false);
    menuButton.current?.focus();
  }

  function toggleSidebar() {
    const next = !pinned;
    localStorage.setItem(sidebarPreference, String(next));
    setPinned(next);
  }

  function handleNavigation(section) {
    navigate(section);
    setMenu(false);
    window.scrollTo(0, 0);
    if (menu) menuButton.current?.focus();
  }

  return <div className="manager-layout" style={art} data-hidden={hidden || undefined} data-pinned={pinned || undefined} onKeyDown={event => {
    if (event.key === "Escape" && menu) {
      closeMenu();
    }
  }}>
    <a className="manager-skip" href="#manager-main">Ir para o conteúdo</a>
    <button className="manager-menu-shade" type="button" tabIndex={-1} data-open={menu || undefined}
      aria-label="Fechar menu pelo fundo" onClick={closeMenu} />
    <aside className="manager-sidebar" data-open={menu || undefined}>
      <div className="manager-sidebar-controls">
        <button className="manager-brand" type="button"
          aria-label={pinned ? "Desafixar barra lateral" : "Fixar barra lateral"}
          aria-pressed={pinned} aria-controls="manager-navigation" onClick={toggleSidebar}>
          <span className="manager-brand-icon"><Football /><ManagerIcon name="bolt" /></span>
          <strong>RPG Manager</strong>
          <span>Super Onze</span>
        </button>
        <div className="manager-brand manager-brand-mobile" aria-hidden="true">
          <strong>RPG Manager</strong><span>Super Onze</span>
        </div>
      </div>
      <nav id="manager-navigation" ref={menuLinks} aria-label="Navegação principal">
        {navigation.filter(([id]) => (hasCampaign || id === "inicio" || id === "campanhas") &&
          (id !== "configuracoes" || canConfigure)).map(([id, label, icon]) =>
          <button type="button" key={id} aria-label={label} aria-current={active === id ? "page" : undefined}
            onClick={() => handleNavigation(id)}>
            <ManagerIcon name={icon} /><span>{label}</span>
          </button>)}
      </nav>
      <div className="manager-sidebar-art" aria-hidden="true" />
    </aside>
    <div className="manager-main-column">
      <header className="manager-masthead">
        <div className="manager-masthead-lightning" aria-hidden="true"><Lightning /></div>
        <button ref={menuButton} className="manager-toggle" type="button" aria-label={menu ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menu} aria-controls="manager-navigation" onClick={() => menu ? closeMenu() : setMenu(true)}>
          <Football />
        </button>
        <div className="manager-masthead-title">RPG Manager</div>
        <div className="manager-profile">
          {avatar ? <img src={avatar} alt="" /> : <Football />}
          <div><strong>{name}</strong>{role && <span className="manager-role">{role}</span>}</div>
          <button type="button" className="manager-secondary" onClick={onLogout}>Sair</button>
        </div>
      </header>
      <div id="manager-main" tabIndex={-1} className="manager-page" key={pageKey}>{children}</div>
    </div>
  </div>;
}

function Lightning() {
  return <svg viewBox="0 0 620 165" preserveAspectRatio="none" aria-hidden="true">
    <path d="m0 145 78-51 43 6 48-47 33 12 63-48m-144 83 12-29m262 71 60-47 39 7 41-42 17 6 69-53m-114 89-14 25-42 8" />
    <path d="m3 164 84-29 22 5 46-20 23 9 58-31m170 60 31-17 31 6 36-20 17 2 71-39" />
  </svg>;
}

export function EnergyCard({ className = "", children }) {
  return <section className={"manager-energy-card " + className}>{children}</section>;
}

function StatCard({ label, count, icon, color, onClick }) {
  return <button className="manager-stat" style={{ "--card-accent": color }} type="button" onClick={onClick}>
    <span className="manager-card-icon"><ManagerIcon name={icon} /></span>
    <span>{label}<strong>{count}</strong></span>
  </button>;
}

const quickLinks = [
  ["equipe", "Equipe", "Membros e organização", "people", "#30dafa"],
  ["jornada", "Jornada", "Sessões e eventos", "map", "#43afff"],
  ["vinculos", "Vínculos", "Relações e conexões", "heart", "#ffda38"],
  ["anotacoes", "Anotações", "Ideias e lembretes", "note", "#ae84ff"],
  ["fichas", "Fichas", "Fichas da campanha", "card", "#aa91ff"],
  ["inventario", "Itens", "Inventário das fichas", "bag", "#ffc338"],
];

function SectionTitle({ icon, children }) {
  return <h2 className="manager-section-title"><ManagerIcon name={icon} />{children}</h2>;
}

export function ManagerHome({ campaign, campaigns, characters, sheetCount, notes, navigate, onOpenSheet, onNewSheet, canCreate }) {
  return <main className="manager-home">
    <section className="manager-welcome manager-energy-card">
      <div className="manager-welcome-copy">
        <h1>Bem-vindo ao <strong>RPG Manager</strong></h1>
        <p>Gerencie campanhas, personagens e toda a sua história no universo de Super Onze!</p>
      </div>
      <div className="manager-welcome-electric" aria-hidden="true">
        <Lightning /><span className="manager-ball-halo"><Football /></span>
      </div>
    </section>
    <div className="manager-stats">
      <StatCard label="Personagens" icon="people" count={characters.length} color="#19c9ff" onClick={() => navigate("personagens")} />
      <StatCard label="Campanhas" icon="flag" count={campaigns} color="#ff9952" onClick={() => navigate("campanhas")} />
      <StatCard label="Fichas" icon="card" count={sheetCount} color="#a880ff" onClick={() => navigate("fichas")} />
      <StatCard label="Anotações" icon="note" count={notes} color="#5df1a0" onClick={() => navigate("anotacoes")} />
    </div>
    <div className="manager-home-grid">
      <EnergyCard className="manager-current">
        <SectionTitle icon="flag">Campanha atual</SectionTitle>
        <div className="manager-current-art" aria-hidden="true" />
        <h3>{campaign.nome}</h3>
        {campaign.descricao && <p>{campaign.descricao}</p>}
        <button className="manager-primary" type="button" onClick={() => navigate("campanha")}>Abrir campanha <ManagerIcon name="arrow" /></button>
      </EnergyCard>
      <EnergyCard className="manager-quick">
        <SectionTitle icon="bolt">Acesso rápido</SectionTitle>
        <div className="manager-quick-grid">
          {quickLinks.map(([id, label, description, icon, color]) =>
            <button className="manager-quick-item" key={id} type="button" style={{ "--card-accent": color }} onClick={() => navigate(id)}>
              <span className="manager-card-icon"><ManagerIcon name={icon} /></span>
              <span><strong>{label}</strong><small>{description}</small></span>
            </button>)}
        </div>
      </EnergyCard>
    </div>
    <EnergyCard className="manager-characters">
      <div className="manager-section-heading">
        <SectionTitle icon="people">Personagens da campanha</SectionTitle>
        {canCreate && <button type="button" className="manager-primary" onClick={onNewSheet}>+ Nova ficha</button>}
      </div>
      <CharacterGrid records={characters} open={onOpenSheet} empty="Nenhum personagem ativo nesta campanha." />
    </EnergyCard>
  </main>;
}

function CharacterGrid({ records, open, empty }) {
  if (!records.length) return <div className="manager-empty">
    <ManagerIcon name="people" /><p>{empty}</p>
    <svg aria-hidden="true" className="manager-empty-team" viewBox="0 0 260 78" fill="currentColor">
      <path d="M6 78c0-13 8-24 22-28l3-10-6-10 7 1-5-10 12 4 8-8 5 10 7-2-2 12-6 11 3 5c11 3 17 15 17 25Zm61 0c0-16 9-31 23-36l2-12-9-7 9-3-5-11 14 4 9-7 9 7 11-4-3 12 5 3-9 7-1 13c12 4 22 18 22 34Zm75 0c0-15 9-32 20-35l4-12-8-7 8-4-1-11 11 5 11-8 6 10 11-1-4 11 5 4-10 7-3 9c10 6 19 19 19 32Zm66 0c0-11 8-21 17-26l3-10-6-9 7 1 4-12 8 8 9 1-1 11-5 10c11 6 16 15 16 26Z" />
    </svg>
  </div>;
  return <div className="manager-character-grid">{records.map(record =>
    <button type="button" className="manager-character" key={record.id} onClick={() => open(record)}>
      {record.imagem ? <img src={record.imagem} alt="" loading="lazy" /> : <ManagerIcon name="people" />}
      <strong>{record.nome || "Sem nome"}</strong><ManagerIcon name="arrow" />
    </button>)}</div>;
}

const directoryLabels = {
  personagens: ["Personagens", "people", "Nenhum personagem ativo nesta campanha."],
  fichas: ["Fichas", "card", "Nenhuma ficha disponível nesta campanha."],
  habilidades: ["Habilidades", "bolt", "Nenhuma ficha disponível para consultar habilidades."],
  inventario: ["Itens", "bag", "Nenhuma ficha disponível para consultar itens."],
};

export function ManagerDirectory({ section, records, open, onNewSheet }) {
  const [label, icon, empty] = directoryLabels[section];
  return <main className="manager-home"><EnergyCard className="manager-characters">
    <div className="manager-section-heading">
      <h1 className="manager-section-title"><ManagerIcon name={icon} />{label}</h1>
      {onNewSheet && <button type="button" className="manager-primary" onClick={onNewSheet}>+ Nova ficha</button>}
    </div>
    {(section === "habilidades" || section === "inventario") && records.length > 0 && <p>Selecione a ficha que você quer consultar.</p>}
    <CharacterGrid records={records} open={open} empty={empty} />
  </EnergyCard></main>;
}
