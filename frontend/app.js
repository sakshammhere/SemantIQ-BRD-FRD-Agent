import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";
import {
  createConversation,
  createProjectWithDocuments,
  deleteConversation,
  deleteProject,
  enableShare,
  getConversation,
  getModelFileUrl,
  getProjectWithDocuments,
  getSharedProject,
  listConversations,
  listProjects,
  replaceProjectDocuments,
  submitBusinessContext,
  testPbiConnection,
  updateConversation,
  updateProject,
  uploadModelFile
} from "./lib/api.js";
import {
  getSession,
  onAuthStateChange,
  signInWithEmail,
  signInWithOAuth,
  signOut,
  signUpWithEmail,
  updatePassword
} from "./lib/auth.js";
import {
  agentStep,
  chatWithAgent,
  crossCheckPlatform,
  deleteApiKey,
  deleteConnection,
  downloadDocumentFile,
  generateDocuments,
  listApiKeys,
  listConnections,
  parseMetadata,
  saveApiKey,
  saveConnection,
  testApiKey,
  testConnection
} from "./lib/backend.js";

const icon = (name, size = 18) => {
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
    plug: '<path d="M9 7V3M15 7V3M6 7h12v3a6 6 0 0 1-12 0V7ZM12 16v5"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1A2 2 0 0 0 1.7 12a2 2 0 0 1 0-4h.2a2 2 0 0 0 1.4-3.4l-.1-.1A2 2 0 0 1 6 1.7l.1.1A2 2 0 0 0 9.5.4V.2a2 2 0 0 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1A2 2 0 0 0 21.1 8h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-1.7 3Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    moon: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="m15 18-6-6 6-6M9 12h10"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    spark: '<path d="m12 3-1.2 5.8L5 10l5.8 1.2L12 17l1.2-5.8L19 10l-5.8-1.2L12 3ZM19 16l-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6L19 16Z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.4 20.4 0 0 1-4.22 5.68M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/><path d="M12 7v5l3 3"/>'
  };
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
};

const SAMPLE_BIM_JSON = JSON.stringify({
  name: "RetailAnalyticsModel",
  model: {
    tables: [
      {
        name: "FactSales", description: "One row per invoice line, refreshed nightly from the order system.",
        columns: [
          { name: "SalesID", dataType: "int64" },
          { name: "OrderDate", dataType: "dateTime" },
          { name: "CustomerID", dataType: "int64" },
          { name: "ProductID", dataType: "int64" },
          { name: "Amount", dataType: "decimal" },
          { name: "Margin", dataType: "decimal" }
        ],
        measures: [
          { name: "Total Revenue", expression: "SUM(FactSales[Amount])" },
          { name: "Gross Margin", expression: "SUM(FactSales[Margin])" },
          { name: "Margin %", expression: "DIVIDE([Gross Margin], [Total Revenue])" }
        ]
      },
      {
        name: "DimCustomer", description: "Customer master with segment and geography attributes.",
        columns: [
          { name: "CustomerID", dataType: "int64" },
          { name: "CustomerName", dataType: "string" },
          { name: "Segment", dataType: "string" },
          { name: "Region", dataType: "string" }
        ],
        measures: [{ name: "Active Customers", expression: "DISTINCTCOUNT(DimCustomer[CustomerID])" }]
      },
      {
        name: "DimProduct", description: "Product catalog hierarchy and pricing attributes.",
        columns: [
          { name: "ProductID", dataType: "int64" },
          { name: "ProductName", dataType: "string" },
          { name: "Category", dataType: "string" },
          { name: "UnitPrice", dataType: "decimal" }
        ],
        measures: []
      }
    ],
    relationships: [
      { fromTable: "FactSales", fromColumn: "CustomerID", toTable: "DimCustomer", toColumn: "CustomerID", fromCardinality: "many", toCardinality: "one" },
      { fromTable: "FactSales", fromColumn: "ProductID", toTable: "DimProduct", toColumn: "ProductID", fromCardinality: "many", toCardinality: "one" }
    ]
  }
}, null, 2);

const googleMark = () => `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"/><path fill="#EA4335" d="M12 4.76c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.61l4 3.11C6.22 6.87 8.87 4.76 12 4.76Z"/></svg>`;
const githubMark = () => `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.1.83-.26.83-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .3Z"/></svg>`;

const state = {
  view: "login",
  authMode: "signin",
  authEmail: "",
  authPassword: "",
  authShowPassword: false,
  user: null,
  step: 1,
  sourceTab: "live",
  connected: false,
  uploaded: false,
  expandedTables: new Set(["FactSales"]),
  platform: "Snowflake",
  platformChecked: false,
  pipeline: -1,
  generated: false,
  resultTab: "brd",
  currentProjectId: null,
  documents: null,
  parsedModel: null,
  uploadedFileName: "",
  uploadedFileBlob: null,
  sourceFilePath: null,
  sourceLabel: "",
  generatedDate: "",
  showSourceModel: false,
  sharedError: null,
  connections: [],
  connectionsLoaded: false,
  connectionsTab: "snowflake",
  connectionDraft: {},
  connectionTested: false,
  editingConnection: false,
  connectionBusy: false,
  crossCheckResult: null,
  pasteDraft: "",
  suggestedKpis: [],
  agentMessages: [
    { role: "assistant", content: "Hi, I'm the SemantIQ agent. I can explain a model, generate a full documentation project, edit or regenerate an existing one, create a share link, or take you anywhere in the app — attach a model with the + button, or ask me to pull one of your saved projects. What would you like to do?" }
  ],
  agentHistory: [],
  agentInput: "",
  agentBusy: false,
  agentProvider: null,
  agentModelContext: null,
  agentModelLabel: "",
  agentMode: "ask",
  agentAttachOpen: false,
  agentAttachTab: null,
  agentPasteDraft: "",
  agentPullQuery: "",
  agentPullProjects: [],
  agentPullLoading: false,
  agentProjectNames: {},
  pendingToolCalls: null,
  pendingDecisions: {},
  agentConversationId: null,
  agentConversations: [],
  agentConversationsLoaded: false,
  agentMemoryOpen: false,
  agentSaveBusy: false,
  projectsCache: [],
  projectsCacheLoaded: false,
  apiKeys: [],
  apiKeysLoaded: false,
  settingsTab: "openai",
  keyDraft: "",
  modelDraft: "",
  testedModels: [],
  testedProvider: null,
  editingKey: false,
  keyBusy: false,
  passwordBusy: false,
  newPassword: "",
  confirmPassword: "",
  theme: localStorage.getItem("sls-theme") || "light",
  projectName: "Retail Analytics Semantic Model",
  objective: "Create a governed, portable semantic layer for retail revenue and margin reporting.",
  audience: "Commercial Analytics, Finance FP&A, and BI Architecture",
  scopeIn: "Revenue, margin, customer segments, product categories, KPI definitions",
  scopeOut: "Transactional write-back, row-level security redesign, historical restatement",
  chat: [],
  contextChatBusy: false,
  assistantDraft: "",
  documentChat: [],
  documentChatBusy: false,
  toast: null,
  busy: false
};

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
const initials = (email) => (email ? email.slice(0, 2).toUpperCase() : "??");
const formatDate = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function render() {
  document.documentElement.dataset.theme = state.theme;
  document.body.innerHTML = state.view === "login" ? `
    ${authPage()}
    ${state.toast ? `<div class="toast"><span class="toast-dot"></span>${esc(state.toast)}</div>` : ""}
  ` : state.view === "shared" ? `
    ${sharedView()}
    ${state.toast ? `<div class="toast"><span class="toast-dot"></span>${esc(state.toast)}</div>` : ""}
  ` : `
    <div class="shell">
      ${sidebar()}
      <main class="main">
        ${topbar()}
        <div class="page ${state.view === "chat" ? "page-chat" : ""}">${state.view === "dashboard" ? dashboard() : state.view === "wizard" ? wizard() : state.view === "chat" ? chatView() : state.view === "settings" ? settingsView() : state.view === "dictionary" ? dictionaryPage() : state.view === "integrations" ? integrationsPage() : results()}</div>
      </main>
    </div>
    ${state.toast ? `<div class="toast"><span class="toast-dot"></span>${esc(state.toast)}</div>` : ""}
  `;
  bindEvents();
}

function authPage() {
  const isSignIn = state.authMode === "signin";
  return `<div class="auth-shell">
    <div class="auth-form-side"><div class="auth-form-inner">
      <div class="auth-brand"><div class="brand-mark"><span></span><span></span><span></span></div><div><strong>SemantIQ</strong><em>documentation ai</em></div></div>
      <div class="auth-tabs">
        <button class="${isSignIn ? "active" : ""}" data-action="auth-mode" data-mode="signin">Sign in</button>
        <button class="${!isSignIn ? "active" : ""}" data-action="auth-mode" data-mode="signup">Create account</button>
      </div>
      <div class="auth-form">
        <h1>${isSignIn ? "Welcome back" : "Create your account"}</h1>
        <p>${isSignIn ? "Sign in to keep documenting your semantic models." : "Set up SemantIQ for your team's workspace."}</p>
        <div class="auth-field"><label>Email</label><input id="auth-email" type="email" placeholder="you@company.com" value="${esc(state.authEmail)}" /></div>
        <div class="auth-field"><label>Password</label><div class="auth-password-wrap"><input id="auth-password" type="${state.authShowPassword ? "text" : "password"}" placeholder="••••••••" value="${esc(state.authPassword)}" /><button type="button" class="auth-password-toggle" data-action="auth-toggle-password" title="${state.authShowPassword ? "Hide password" : "Show password"}">${icon(state.authShowPassword ? "eyeOff" : "eye", 15)}</button></div></div>
        <div class="auth-meta-row">${isSignIn ? `<label><input type="checkbox" /> Remember me</label><button class="auth-forgot" data-action="toast" data-message="Password reset isn't wired up in this demo yet.">Forgot password?</button>` : `<label><input type="checkbox" /> I agree to the workspace terms</label>`}</div>
        <button class="btn btn-primary full" data-action="auth-submit" ${state.busy ? "disabled" : ""}>${state.busy ? '<span class="spinner"></span>' : ""} ${isSignIn ? "Sign in" : "Create account"} ${icon("arrow", 15)}</button>
      </div>
      <div class="auth-divider"><span>or continue with</span></div>
      <div class="auth-oauth-row">
        <button class="auth-oauth-btn" data-action="auth-google" ${state.busy ? "disabled" : ""}>${googleMark()} Google</button>
        <button class="auth-oauth-btn" data-action="auth-github" ${state.busy ? "disabled" : ""}>${githubMark()} GitHub</button>
      </div>
      <div class="auth-security">${icon("lock", 12)} Sessions are managed by Supabase Auth</div>
    </div></div>
    <div class="auth-marketing"><div class="auth-marketing-inner">
      <span class="auth-eyebrow-pill">${icon("spark", 12)} AI Documentation Workspace</span>
      <h2>Turn semantic models into shared understanding.</h2>
      <p>SemantIQ reads your Power BI model, captures the business context around it, and drafts governed BRD, FRD, and semantic dictionary artifacts your whole data team can trust.</p>
      <div class="auth-snapshot">
        <div class="auth-snapshot-head"><b>Documentation coverage</b><span><i></i>Retail Analytics</span></div>
        <div class="auth-snapshot-body">
          <div class="auth-ring"><b>92%</b></div>
          <div class="auth-snapshot-list">
            <div><span class="check-square">${icon("check", 11)}</span> 12 semantic definitions documented</div>
            <div><span class="check-square">${icon("check", 11)}</span> 4 measures explained in business language</div>
            <div><span class="check-square violet-check">${icon("check", 11)}</span> Snowflake mapping cross-checked</div>
          </div>
        </div>
      </div>
      <div class="auth-features">
        <div class="auth-feature"><span class="auth-feature-icon">${icon("database", 16)}</span><div><b>Parses Power BI semantic models</b><p>Tables, relationships, calculated columns, KPIs, and DAX measures — extracted automatically.</p></div></div>
        <div class="auth-feature"><span class="auth-feature-icon">${icon("file", 16)}</span><div><b>Drafts BRD, FRD & business-friendly DAX</b><p>Structured documentation generated from metadata and the business context you provide.</p></div></div>
        <div class="auth-feature"><span class="auth-feature-icon">${icon("plug", 16)}</span><div><b>Connects to enterprise data platforms</b><p>Cross-check and map your semantic layer against Snowflake, Databricks, and AWS.</p></div></div>
      </div>
    </div></div>
  </div>`;
}

async function loadSharedProject(token) {
  try {
    const result = await getSharedProject(token);
    if (!result) {
      state.sharedError = "This share link is invalid or has been disabled.";
      render();
      return;
    }
    const { project, docs } = result;
    state.projectName = project.name;
    state.platform = project.platform || state.platform;
    state.documents = docs;
    state.sourceLabel = project.source_model || "the connected source model";
    state.generatedDate = new Date(project.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    state.resultTab = "brd";
    render();
  } catch (error) {
    state.sharedError = error.message || "Could not load this shared project.";
    render();
  }
}

function sharedView() {
  if (state.sharedError) {
    return `<div class="auth-shell"><div class="auth-form-side"><div class="auth-form-inner">
      <div class="auth-brand"><div class="brand-mark"><span></span><span></span><span></span></div><div><strong>SemantIQ</strong><em>documentation ai</em></div></div>
      <h1>Link unavailable</h1><p>${esc(state.sharedError)}</p>
      <a class="btn btn-primary full" href="${location.pathname}">Go to SemantIQ ${icon("arrow", 15)}</a>
    </div></div></div>`;
  }
  const tabs = [["brd", "BRD preview", "Business requirements"], ["frd", "FRD preview", "Functional requirements"], ["dictionary", "Semantic dictionary", "Source definitions"], ["mapping", "Integration mapping", "Platform comparison"]];
  return `<div class="shared-shell">
    <header class="shared-topbar"><div class="doc-brand"><span class="brand-mark small"><span></span><span></span><span></span></span><b>SemantIQ</b></div><span class="status-pill"><i></i> Read-only shared view</span><a class="btn btn-ghost" href="${location.pathname}">${icon("arrow", 14)} Go to SemantIQ</a></header>
    <div class="page">
      <div class="results-shell"><section class="results-heading"><div><div class="eyebrow">DOCUMENTATION SET · SHARED</div><h1>${esc(state.projectName)}</h1><p>Power BI → ${state.platform} <span class="separator">·</span> Version 1.0</p></div></section>
        <div class="result-grid"><section class="document-area"><div class="result-tabs">${tabs.map(([id, label, sub]) => `<button class="${state.resultTab === id ? "active" : ""}" data-action="result-tab" data-tab="${id}"><b>${label}</b><small>${sub}</small></button>`).join("")}</div><article class="document-preview">${documentContent()}</article></section></div>
      </div>
    </div>
  </div>`;
}

function sidebar() {
  const item = (id, label, glyph, meta = "") => `<button class="nav-item ${state.view === id ? "active" : ""}" data-action="nav" data-view="${id}">${icon(glyph, 17)}<span>${label}</span>${meta ? `<small>${meta}</small>` : ""}</button>`;
  return `<aside class="sidebar">
    <div class="brand"><div class="brand-mark"><span></span><span></span><span></span></div><div><strong>SemantIQ</strong><em>documentation ai</em></div></div>
    <div class="workspace-switcher static"><div class="workspace-avatar">${esc(initials(state.user?.email))}</div><div><b>Personal workspace</b><small>${esc(state.user?.email || "")}</small></div></div>
    <div class="nav-label">Workspace</div>
    ${item("chat", "Agent Chat", "spark")}
    ${item("dashboard", "Projects", "grid")}
    ${item("wizard", "New documentation", "plus")}
    <div class="nav-label nav-label-spaced">Explore</div>
    ${item("dictionary", "Data dictionary", "database")}
    ${item("integrations", "Integrations", "plug")}
    <div class="sidebar-bottom">
      ${item("settings", "Settings", "settings")}
      <button class="nav-item" data-action="sign-out">${icon("logout", 17)}<span>Sign out</span></button>
      <button class="profile-row" data-action="nav" data-view="settings"><span class="avatar">${esc(initials(state.user?.email))}</span><span><b>${esc(state.user?.email || "Signed in")}</b><small>Member</small></span><span class="online"></span></button>
    </div>
  </aside>`;
}

function topbar() {
  const trail = state.view === "chat" ? "Agent Chat" : state.view === "dashboard" ? "Projects" : state.view === "wizard" ? "New documentation" : state.view === "settings" ? "Settings" : state.view === "dictionary" ? "Data dictionary" : state.view === "integrations" ? "Integrations" : esc(state.projectName);
  return `<header class="topbar"><div class="breadcrumbs"><span>SemantIQ</span><b>/</b><strong>${trail}</strong></div>
    <div class="top-actions"><span class="status-live"><i></i> All systems operational</span><button class="icon-btn" data-action="theme" title="Toggle light and dark mode">${icon(state.theme === "light" ? "moon" : "sun", 17)}</button><button class="help-btn" data-action="toast" data-message="Tip: start by connecting a Power BI model.">?</button></div>
  </header>`;
}

function dashboard() {
  return `<div class="content-narrow">
    <section class="page-intro intro-row"><div><div class="eyebrow">DOCUMENTATION WORKSPACE</div><h1>Projects</h1><p>Turn semantic models into documentation your whole data team can trust.</p></div><button class="btn btn-primary" data-action="new-project">${icon("plus", 16)} New project</button></section>
    <section class="metrics">
      <div class="metric-card"><span class="metric-label">Documentation projects</span><strong id="metric-projects">—</strong><small id="metric-projects-sub" class="muted">Loading…</small></div>
      <div class="metric-card"><span class="metric-label">Models documented</span><strong id="metric-models">—</strong><small class="muted">One model per project</small></div>
      <div class="metric-card"><span class="metric-label">Last generation</span><strong id="metric-last">—</strong><small class="muted">Most recent artifact set</small></div>
    </section>
    <section class="section-head"><div><h2>Recent projects</h2><p>Documentation sets and model context in this workspace.</p></div><div class="list-tools"><div class="search-field">${icon("search", 15)}<input id="project-search" placeholder="Search projects" /></div><button class="filter-btn" data-action="toast" data-message="All projects are currently shown.">All statuses ${icon("chevron", 13)}</button></div></section>
    <div id="projects-list-wrap"><div class="project-table-wrap"><table class="project-table"><thead><tr><th>Project</th><th>Source model</th><th>Status</th><th>Last updated</th><th></th></tr></thead><tbody id="projects-body"></tbody></table></div></div>
    <section class="callout"><div class="callout-icon">${icon("spark", 19)}</div><div><b>Start with a model, finish with shared understanding.</b><p>Connect a Power BI model and SemantIQ will surface its structure, clarify the business meaning, and produce BRD, FRD, dictionary, and mapping artifacts.</p></div><button class="text-btn" data-action="new-project">Create a project ${icon("arrow", 15)}</button></section>
  </div>`;
}

async function paintProjects() {
  const wrap = document.querySelector("#projects-list-wrap");
  if (!wrap) return;
  let rows = [];
  try {
    rows = await listProjects();
  } catch (error) {
    toast(error.message || "Could not load projects.");
  }

  const metricProjects = document.querySelector("#metric-projects");
  const metricProjectsSub = document.querySelector("#metric-projects-sub");
  const metricModels = document.querySelector("#metric-models");
  const metricLast = document.querySelector("#metric-last");
  if (metricProjects) metricProjects.textContent = String(rows.length).padStart(2, "0");
  if (metricProjectsSub) metricProjectsSub.textContent = rows.length ? "Across this workspace" : "None generated yet";
  if (metricModels) metricModels.textContent = String(rows.length).padStart(2, "0");
  if (metricLast) metricLast.textContent = rows.length ? formatDate(rows[0].updated_at) : "—";

  if (!rows.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="callout-icon">${icon("file", 19)}</div><b>No projects yet</b><p>Generate your first documentation set from the wizard and it will show up here.</p><button class="btn btn-primary" data-action="new-project">${icon("plus", 15)} New project</button></div>`;
    bindActionElements(wrap);
    return;
  }

  wrap.innerHTML = `<div class="project-table-wrap"><table class="project-table"><thead><tr><th>Project</th><th>Source model</th><th>Status</th><th>Last updated</th><th></th></tr></thead><tbody id="projects-body"></tbody></table></div>`;
  const body = document.querySelector("#projects-body");
  body.innerHTML = rows.map((project, index) => `<tr data-project="${esc(project.name.toLowerCase())}" data-id="${esc(project.id)}">
    <td><div class="project-name"><span class="project-glyph">${icon(index === 0 ? "database" : "file", 17)}</span><div><b>${esc(project.name)}</b><small>Semantic model documentation</small></div></div></td>
    <td><span class="mono muted">${esc(project.source_model || "—")}</span></td>
    <td><span class="status-pill ${project.status.toLowerCase()}"><i></i>${project.status}</span></td>
    <td><span class="muted">${formatDate(project.updated_at)}</span></td>
    <td><button class="row-more" data-action="open-project" title="Open project">${icon("chevron", 16)}</button></td>
  </tr>`).join("");
  bindActionElements(body);
}

async function loadProjectsCache() {
  try {
    state.projectsCache = await listProjects();
  } catch (error) {
    toast(error.message || "Could not load projects.");
  }
  state.projectsCacheLoaded = true;
  render();
}

function dictionaryPage() {
  const rows = state.projectsCache;
  return `<div class="content-narrow">
    <section class="page-intro"><div><div class="eyebrow">EXPLORE</div><h1>Data dictionary</h1><p>Every generated semantic dictionary across your projects, in one place.</p></div></section>
    ${!state.projectsCacheLoaded
      ? `<div class="field-note"><span class="mini-spinner"></span> Loading…</div>`
      : !rows.length
      ? `<div class="empty-state"><div class="callout-icon">${icon("database", 19)}</div><b>No dictionaries yet</b><p>Generate a project and its semantic dictionary will show up here.</p><button class="btn btn-primary" data-action="new-project">${icon("plus", 15)} New project</button></div>`
      : `<div class="project-table-wrap"><table class="project-table"><thead><tr><th>Project</th><th>Platform</th><th>Tables</th><th>Last updated</th><th></th></tr></thead><tbody>${rows.map((p) => `<tr data-id="${esc(p.id)}"><td><div class="project-name"><span class="project-glyph">${icon("database", 17)}</span><div><b>${esc(p.name)}</b><small>${esc(p.source_model || "")}</small></div></div></td><td><span class="mono muted">${esc(p.platform || "—")}</span></td><td><span class="muted">${p.model_snapshot?.tables?.length ?? "—"}</span></td><td><span class="muted">${formatDate(p.updated_at)}</span></td><td><button class="row-more" data-action="open-project" data-id="${esc(p.id)}" data-tab="dictionary" title="View dictionary">${icon("chevron", 16)}</button></td></tr>`).join("")}</tbody></table></div>`
    }
  </div>`;
}

function integrationsPage() {
  const rows = state.projectsCache;
  return `<div class="content-narrow">
    <section class="page-intro"><div><div class="eyebrow">EXPLORE</div><h1>Integrations</h1><p>Manage platform connections and jump to each project's integration mapping.</p></div></section>
    ${connectionsCard()}
    <section class="card settings-card">
      <div class="card-title"><div><h3>Projects by platform</h3><p>Jump to a project's integration mapping report.</p></div></div>
      ${!state.projectsCacheLoaded
        ? `<div class="field-note"><span class="mini-spinner"></span> Loading…</div>`
        : !rows.length
        ? `<div class="empty-state"><div class="callout-icon">${icon("plug", 19)}</div><b>No projects yet</b><p>Generate a project to see its platform mapping here.</p></div>`
        : `<div class="project-table-wrap"><table class="project-table"><thead><tr><th>Project</th><th>Platform</th><th>Status</th><th></th></tr></thead><tbody>${rows.map((p) => `<tr data-id="${esc(p.id)}"><td><b>${esc(p.name)}</b></td><td><span class="mono muted">${esc(p.platform || "—")}</span></td><td><span class="status-pill ${p.status.toLowerCase()}"><i></i>${esc(p.status)}</span></td><td><button class="row-more" data-action="open-project" data-id="${esc(p.id)}" data-tab="mapping" title="View mapping">${icon("chevron", 16)}</button></td></tr>`).join("")}</tbody></table></div>`
      }
    </section>
  </div>`;
}

const PROVIDER_META = {
  openai: { label: "OpenAI", placeholder: "sk-...", model: "gpt-4o-mini", link: "https://platform.openai.com/api-keys", linkLabel: "platform.openai.com/api-keys" },
  groq: { label: "Groq", placeholder: "gsk_...", model: "llama-3.3-70b-versatile", link: "https://console.groq.com/keys", linkLabel: "console.groq.com/keys" },
  gemini: { label: "Gemini", placeholder: "AIza...", model: "gemini-2.0-flash", link: "https://aistudio.google.com/apikey", linkLabel: "aistudio.google.com/apikey" },
  anthropic: { label: "Claude", placeholder: "sk-ant-...", model: "claude-3-5-sonnet-latest", link: "https://console.anthropic.com/settings/keys", linkLabel: "console.anthropic.com/settings/keys" }
};
const providerLabel = (id) => PROVIDER_META[id]?.label || id;

const PLATFORM_META = {
  snowflake: {
    label: "Snowflake",
    fields: [
      { key: "account", label: "Account identifier", placeholder: "xy12345.us-east-1" },
      { key: "user", label: "Username", placeholder: "SVC_USER" },
      { key: "password", label: "Password", placeholder: "••••••••", type: "password" },
      { key: "warehouse", label: "Warehouse", placeholder: "COMPUTE_WH" },
      { key: "database", label: "Database", placeholder: "ANALYTICS" },
      { key: "schema", label: "Schema", placeholder: "PUBLIC" },
      { key: "role", label: "Role (optional)", placeholder: "SYSADMIN" }
    ]
  },
  databricks: {
    label: "Databricks",
    fields: [
      { key: "server_hostname", label: "Server hostname", placeholder: "adb-xxxx.azuredatabricks.net" },
      { key: "http_path", label: "HTTP path", placeholder: "/sql/1.0/warehouses/xxxx" },
      { key: "access_token", label: "Access token", placeholder: "dapi...", type: "password" },
      { key: "catalog", label: "Catalog", placeholder: "main" },
      { key: "schema", label: "Schema", placeholder: "default" }
    ]
  },
  aws: {
    label: "AWS",
    fields: [
      { key: "aws_access_key_id", label: "Access key ID", placeholder: "AKIA..." },
      { key: "aws_secret_access_key", label: "Secret access key", placeholder: "••••••••", type: "password" },
      { key: "region", label: "Region", placeholder: "us-east-1" },
      { key: "glue_database", label: "Glue database", placeholder: "analytics_db" }
    ]
  }
};
const platformLabel = (id) => PLATFORM_META[id]?.label || id;
const isPlatformConnected = (id) => state.connections.some((c) => c.platform === id);

const AGENT_TOOL_META = {
  list_projects: { category: "read", label: "List your projects" },
  get_project: { category: "read", label: "Open project details" },
  get_document: { category: "read", label: "Read a document" },
  get_workspace_status: { category: "read", label: "Check connection status" },
  get_model_diagram: { category: "read", label: "Render a relationship diagram" },
  generate_documentation: { category: "write", label: "Generate a new project" },
  edit_project_context: { category: "write", label: "Edit project context" },
  regenerate_documents: { category: "write", label: "Regenerate documents" },
  create_share_link: { category: "write", label: "Create a share link" },
  download_document: { category: "write", label: "Download a document" },
  navigate: { category: "write", label: "Navigate the app" },
  delete_project: { category: "destructive", label: "Delete a project" },
  sign_out: { category: "destructive", label: "Sign out" }
};
const READ_TOOL_NAMES = Object.keys(AGENT_TOOL_META).filter((k) => AGENT_TOOL_META[k].category === "read");
const projectLabel = (id) => state.agentProjectNames[id] || id;

function summarizeToolCall(name, args) {
  switch (name) {
    case "list_projects": return "List your saved projects";
    case "get_project": return `Open "${projectLabel(args.project_id)}"`;
    case "get_document": return `Read the ${(args.doc_type || "").toUpperCase()} for "${projectLabel(args.project_id)}"`;
    case "get_workspace_status": return "Check which providers/connections are active";
    case "get_model_diagram": return args.project_id ? `Render the relationship diagram for "${projectLabel(args.project_id)}"` : "Render the relationship diagram for the attached model";
    case "generate_documentation": return `Generate a new project "${args.name}" for ${args.platform}`;
    case "edit_project_context": return `Edit "${projectLabel(args.project_id)}"${args.name ? ` → rename to "${args.name}"` : ""}`;
    case "regenerate_documents": return `Regenerate documents for "${projectLabel(args.project_id)}"`;
    case "create_share_link": return `Create a public share link for "${projectLabel(args.project_id)}"`;
    case "download_document": return `Download the ${(args.doc_type || "").toUpperCase()} for "${projectLabel(args.project_id)}"`;
    case "navigate": return `Go to ${args.view}`;
    case "delete_project": return `Permanently delete "${projectLabel(args.project_id)}"`;
    case "sign_out": return "Sign you out of SemantIQ";
    default: return name;
  }
}

function cacheAgentToolNames(name, args, outcome) {
  if (name === "list_projects" && Array.isArray(outcome)) {
    outcome.forEach((p) => { if (p.id) state.agentProjectNames[p.id] = p.name; });
  } else if (outcome && outcome.id && outcome.name) {
    state.agentProjectNames[outcome.id] = outcome.name;
  }
}

function mermaidId(name) {
  const cleaned = String(name || "").replace(/[^a-zA-Z0-9_]/g, "_");
  return /^[0-9]/.test(cleaned) ? `T_${cleaned}` : cleaned || "Table";
}

const CARDINALITY_TO_MERMAID = {
  "many-to-one": "}o--||",
  "one-to-many": "||--o{",
  "one-to-one": "||--||",
  "many-to-many": "}o--o{"
};

function buildRelationshipMermaid(model) {
  const tables = model?.tables || [];
  const relationships = model?.relationships || [];
  const lines = ["erDiagram"];
  if (relationships.length) {
    relationships.forEach((r) => {
      const fromTable = (r.from || "").split(".")[0];
      const toTable = (r.to || "").split(".")[0];
      if (!fromTable || !toTable) return;
      const notation = CARDINALITY_TO_MERMAID[(r.cardinality || "").toLowerCase()] || "||--o{";
      lines.push(`    ${mermaidId(fromTable)} ${notation} ${mermaidId(toTable)} : "${(r.from || "").replace(/"/g, "")} to ${(r.to || "").replace(/"/g, "")}"`);
    });
  } else {
    tables.forEach((t) => lines.push(`    ${mermaidId(t.name)} { string note "no relationships defined" }`));
  }
  return lines.join("\n");
}

async function executeAgentTool(name, args) {
  switch (name) {
    case "list_projects": {
      const rows = await listProjects();
      return rows.map((p) => ({ id: p.id, name: p.name, platform: p.platform, status: p.status, updated_at: p.updated_at }));
    }
    case "get_project": {
      const { project, docs } = await getProjectWithDocuments(args.project_id);
      return {
        id: project.id, name: project.name, platform: project.platform, status: project.status,
        source_model: project.source_model, objective: project.objective, audience: project.audience,
        scope_in: project.scope_in, scope_out: project.scope_out,
        has_saved_model: Boolean(project.model_snapshot), document_types: Object.keys(docs)
      };
    }
    case "get_document": {
      const { docs } = await getProjectWithDocuments(args.project_id);
      return docs[args.doc_type] || { error: `No ${args.doc_type} document found for this project.` };
    }
    case "get_workspace_status": {
      const keys = state.apiKeysLoaded ? state.apiKeys : await listApiKeys();
      const conns = state.connectionsLoaded ? state.connections : await listConnections();
      return { ai_providers_connected: keys.map((k) => k.provider), platform_connections: conns.map((c) => c.platform) };
    }
    case "get_model_diagram": {
      let model = state.agentModelContext;
      let label = state.agentModelLabel || "attached model";
      if (args.project_id) {
        const { project } = await getProjectWithDocuments(args.project_id);
        if (!project.model_snapshot) throw new Error("This project has no saved model to diagram.");
        model = project.model_snapshot;
        label = project.name;
      }
      if (!model) throw new Error("No semantic model is attached to this conversation. Ask the user to attach one first.");
      const mermaidSyntax = buildRelationshipMermaid(model);
      state.agentMessages.push({ role: "diagram", mermaid: mermaidSyntax, title: `${label} — table relationships` });
      return { rendered: true, tables: (model.tables || []).length, relationships: (model.relationships || []).length };
    }
    case "generate_documentation": {
      if (!state.agentModelContext) throw new Error("No semantic model is attached to this conversation. Ask the user to attach one with the + button first.");
      const businessContext = { projectName: args.name, objective: args.objective, audience: args.audience, scopeIn: args.scope_in, scopeOut: args.scope_out };
      const generated = await generateDocuments({ modelContext: state.agentModelContext, businessContext, platform: args.platform, provider: state.agentProvider });
      const project = await createProjectWithDocuments({
        name: args.name, sourceModel: `Power BI · ${state.agentModelLabel || "attached model"}`, platform: args.platform,
        docs: generated.docs, modelSnapshot: state.agentModelContext, sourceFilePath: null,
        objective: args.objective, audience: args.audience, scopeIn: args.scope_in, scopeOut: args.scope_out
      });
      return { id: project.id, name: project.name, platform: project.platform, documents: Object.keys(generated.docs), suggested_kpis: generated.suggested_kpis || [] };
    }
    case "edit_project_context": {
      const updated = await updateProject(args.project_id, {
        name: args.name, objective: args.objective, audience: args.audience,
        scopeIn: args.scope_in, scopeOut: args.scope_out, platform: args.platform
      });
      return { id: updated.id, name: updated.name, updated_fields: Object.keys(args).filter((k) => k !== "project_id" && args[k] != null) };
    }
    case "regenerate_documents": {
      const { project } = await getProjectWithDocuments(args.project_id);
      if (!project.model_snapshot) throw new Error("This project has no saved model to regenerate from.");
      const businessContext = { projectName: project.name, objective: project.objective, audience: project.audience, scopeIn: project.scope_in, scopeOut: project.scope_out };
      const generated = await generateDocuments({ modelContext: project.model_snapshot, businessContext, platform: project.platform, provider: state.agentProvider });
      await replaceProjectDocuments(args.project_id, generated.docs);
      return { id: args.project_id, name: project.name, documents: Object.keys(generated.docs), suggested_kpis: generated.suggested_kpis || [] };
    }
    case "create_share_link": {
      const token = await enableShare(args.project_id);
      return { share_url: `${location.origin}${location.pathname}?share=${token}` };
    }
    case "download_document": {
      const { blob, filename } = await downloadDocumentFile(args.project_id, args.doc_type);
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(blob); anchor.download = filename;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(anchor.href), 500);
      return { downloaded: filename };
    }
    case "navigate": {
      const view = args.view;
      state.view = view;
      if (view === "wizard") state.step = 1;
      render();
      if (view === "dashboard") paintProjects();
      if (view === "settings") { loadApiKeys(); loadConnections(); }
      return { navigated_to: view };
    }
    case "delete_project": {
      await deleteProject(args.project_id);
      state.projectsCache = state.projectsCache.filter((p) => p.id !== args.project_id);
      return { deleted_project_id: args.project_id };
    }
    case "sign_out": {
      await signOut();
      state.apiKeys = []; state.apiKeysLoaded = false;
      state.connections = []; state.connectionsLoaded = false;
      state.projectsCache = []; state.projectsCacheLoaded = false;
      return { signed_out: true };
    }
    default:
      throw new Error(`Unknown tool '${name}'.`);
  }
}

let pendingApprovalResolve = null;

function requestApproval(calls) {
  return new Promise((resolve) => {
    state.pendingToolCalls = calls;
    state.pendingDecisions = {};
    pendingApprovalResolve = resolve;
    render();
  });
}

function resolveApproval(decisions) {
  if (!pendingApprovalResolve) return;
  const resolve = pendingApprovalResolve;
  pendingApprovalResolve = null;
  state.pendingToolCalls = null;
  state.pendingDecisions = {};
  resolve(decisions);
}

function maybeResolvePending() {
  const calls = state.pendingToolCalls || [];
  const decisions = state.pendingDecisions || {};
  if (calls.length && calls.every((tc) => decisions[tc.id] !== undefined)) {
    resolveApproval({ ...decisions });
  } else {
    render();
  }
}

async function runAgentLoop() {
  let guard = 0;
  while (guard++ < 8) {
    let result;
    try {
      const allowedTools = state.agentMode === "plan" ? READ_TOOL_NAMES : undefined;
      result = await agentStep({ messages: state.agentHistory, modelContext: state.agentModelContext, provider: state.agentProvider, allowedTools });
    } catch (error) {
      state.agentMessages.push({ role: "assistant", content: error.message || "Something went wrong. Please try again." });
      render();
      return;
    }

    state.agentHistory.push({ role: "assistant", content: result.content || null, tool_calls: result.tool_calls || undefined });
    if (result.content) state.agentMessages.push({ role: "assistant", content: result.content });
    render();

    if (!result.tool_calls || !result.tool_calls.length) return;

    const autoCalls = result.tool_calls.filter((tc) => {
      const category = AGENT_TOOL_META[tc.name]?.category || "write";
      if (category === "read") return true;
      if (category === "destructive") return false;
      return state.agentMode === "auto";
    });
    const approvalCalls = result.tool_calls.filter((tc) => !autoCalls.includes(tc));

    let decisions = {};
    if (approvalCalls.length) {
      decisions = await requestApproval(approvalCalls);
    }

    let signedOut = false;
    for (const tc of result.tool_calls) {
      const needsApproval = approvalCalls.includes(tc);
      const approved = !needsApproval || decisions[tc.id];
      const summary = summarizeToolCall(tc.name, tc.arguments);
      if (!approved) {
        state.agentHistory.push({ role: "tool", tool_call_id: tc.id, name: tc.name, content: JSON.stringify({ denied: true, reason: "The user declined this action." }) });
        state.agentMessages.push({ role: "tool-note", denied: true, summary });
        continue;
      }
      try {
        const outcome = await executeAgentTool(tc.name, tc.arguments);
        cacheAgentToolNames(tc.name, tc.arguments, outcome);
        state.agentHistory.push({ role: "tool", tool_call_id: tc.id, name: tc.name, content: JSON.stringify(outcome).slice(0, 6000) });
        state.agentMessages.push({ role: "tool-note", ok: true, summary });
        if (tc.name === "sign_out") signedOut = true;
      } catch (error) {
        state.agentHistory.push({ role: "tool", tool_call_id: tc.id, name: tc.name, content: JSON.stringify({ error: error.message || String(error) }) });
        state.agentMessages.push({ role: "tool-note", error: error.message || String(error), summary });
      }
    }
    render();
    if (signedOut) return;
  }
  state.agentMessages.push({ role: "assistant", content: "I've reached my step limit for this turn — let me know if you'd like me to continue." });
}

function inlineMd(escapedText) {
  return escapedText
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<i>$1</i>")
    .replace(/\n/g, "<br />");
}

function renderMdBlock(block) {
  if (!block) return "";
  if (/^CODE\d+$/.test(block)) return block;
  const lines = block.split("\n");

  if (lines.length >= 2 && /^\|.*\|$/.test(lines[0].trim()) && /^\|?[\s:|-]+\|?$/.test(lines[1].trim())) {
    const headerCells = lines[0].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const bodyRows = lines.slice(2).filter((l) => l.trim()).map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    return `<div class="md-table-wrap"><table class="md-table"><thead><tr>${headerCells.map((c) => `<th>${inlineMd(esc(c))}</th>`).join("")}</tr></thead><tbody>${bodyRows.map((row) => `<tr>${row.map((c) => `<td>${inlineMd(esc(c))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  const headerMatch = lines.length === 1 && block.match(/^(#{1,4})\s+(.*)$/);
  if (headerMatch) {
    return `<div class="md-heading">${inlineMd(esc(headerMatch[2]))}</div>`;
  }

  if (lines.length && lines.every((l) => /^\s*[-*]\s+/.test(l))) {
    return `<ul class="md-list">${lines.map((l) => `<li>${inlineMd(esc(l.trim().replace(/^[-*]\s+/, "")))}</li>`).join("")}</ul>`;
  }

  if (lines.length && lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
    return `<ol class="md-list">${lines.map((l) => `<li>${inlineMd(esc(l.trim().replace(/^\d+\.\s+/, "")))}</li>`).join("")}</ol>`;
  }

  return `<p class="md-p">${inlineMd(esc(block))}</p>`;
}

function renderMarkdown(raw) {
  const text = String(raw || "");
  const codeBlocks = [];
  const withPlaceholders = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push({ lang: (lang || "").trim(), code });
    return `CODE${codeBlocks.length - 1}`;
  });

  const blocks = withPlaceholders.split(/\n{2,}/);
  const html = blocks.map((b) => renderMdBlock(b.trim())).filter(Boolean).join("");

  return html.replace(/CODE(\d+)/g, (_, i) => {
    const { lang, code } = codeBlocks[Number(i)];
    if (lang === "mermaid") return `<pre class="mermaid">${esc(code.trim())}</pre>`;
    return `<pre class="md-code"><code>${esc(code.trim())}</code></pre>`;
  });
}

function renderAgentText(text) {
  return renderMarkdown(text);
}

function agentMemoryPanel() {
  return `<aside class="agent-memory-panel">
    <div class="agent-memory-head"><b>Chat history</b><button data-action="toggle-agent-memory" title="Close">${icon("close", 14)}</button></div>
    <button class="btn btn-dark" data-action="agent-new-chat">${icon("plus", 14)} New chat</button>
    <div class="agent-memory-list">${!state.agentConversationsLoaded
      ? `<div class="field-note"><span class="mini-spinner"></span> Loading…</div>`
      : state.agentConversations.length
      ? state.agentConversations.map((c) => `<div class="agent-memory-row ${c.id === state.agentConversationId ? "active" : ""}"><button data-action="open-agent-conversation" data-id="${esc(c.id)}"><b>${esc(c.title)}</b><small>${formatDate(c.updated_at)}</small></button><button class="row-delete" data-action="delete-agent-conversation" data-id="${esc(c.id)}" title="Delete">${icon("close", 11)}</button></div>`).join("")
      : `<div class="field-note">No saved chats yet.</div>`}</div>
  </aside>`;
}

function chatView() {
  const hasKeys = state.apiKeys.length > 0;
  const modes = [["auto", "Auto"], ["ask", "Ask each time"], ["plan", "Plan only"]];
  return `<div class="agent-page">
    ${state.agentMemoryOpen ? agentMemoryPanel() : ""}
    <div class="agent-shell">
      <div class="agent-header"><div><h1>SemantIQ Agent</h1><p>A real coworker for your semantic layer — explains, generates, edits, and manages your projects.</p></div>
      ${hasKeys ? `<div class="agent-header-controls">
          <button class="icon-btn" data-action="toggle-agent-memory" title="Chat history">${icon("history", 16)}</button>
          <button class="btn btn-ghost" data-action="agent-new-chat" title="New chat">${icon("plus", 14)} New</button>
          <button class="btn btn-ghost" data-action="agent-save-chat" ${state.agentSaveBusy ? "disabled" : ""} title="Save this chat">${state.agentSaveBusy ? '<span class="spinner"></span>' : icon("check", 14)} Save</button>
          <div class="agent-mode-picker">${modes.map(([id, label]) => `<button class="${state.agentMode === id ? "active" : ""}" data-action="agent-mode" data-mode="${id}" title="Permission mode">${label}</button>`).join("")}</div>
          <label class="agent-provider"><span>Model</span><select id="agent-provider-select">${state.apiKeys.map((k) => `<option value="${k.provider}" ${state.agentProvider === k.provider ? "selected" : ""}>${providerLabel(k.provider)}${k.model ? ` · ${esc(k.model)}` : ""}</option>`).join("")}</select></label>
        </div>` : ""}
      </div>
      ${!state.apiKeysLoaded ? `<div class="agent-connect"><span class="spinner"></span></div>` : hasKeys ? agentChatPanel() : agentConnectPrompt()}
    </div>
  </div>`;
}

function agentConnectPrompt() {
  return `<div class="agent-connect"><div class="callout-icon">${icon("spark", 22)}</div><b>Connect an AI provider to start chatting</b><p>SemantIQ uses your own API key (OpenAI, Groq, Gemini, or Claude) — never shared, encrypted at rest, and only decrypted server-side for your own requests.</p><button class="btn btn-primary" data-action="nav" data-view="settings">${icon("settings", 15)} Go to Settings</button></div>`;
}

function agentMessageRow(m) {
  if (m.role === "tool-note") {
    const cls = m.denied ? "denied" : m.error ? "error" : "ok";
    return `<div class="tool-note ${cls}">${icon(m.denied || m.error ? "close" : "check", 12)} <span>${esc(m.summary)}</span>${m.error ? `<small>${esc(m.error)}</small>` : m.denied ? `<small>Declined</small>` : ""}</div>`;
  }
  if (m.role === "diagram") {
    return `<div class="diagram-message"><div class="diagram-title">${icon("database", 12)} ${esc(m.title || "Diagram")}</div><pre class="mermaid">${esc(m.mermaid)}</pre></div>`;
  }
  return `<div class="chat-row ${m.role}"><div class="chat-avatar">${m.role === "assistant" ? icon("spark", 12) : esc(initials(state.user?.email))}</div><div><div class="bubble">${renderAgentText(m.content)}</div></div></div>`;
}

function approvalCardsHtml() {
  const calls = state.pendingToolCalls || [];
  const decisions = state.pendingDecisions || {};
  return `<div class="approval-stack">${calls.map((tc) => {
    const decided = decisions[tc.id];
    const category = AGENT_TOOL_META[tc.name]?.category || "write";
    return `<div class="approval-card ${category}">
      <div class="approval-head"><span class="approval-badge ${category}">${category === "destructive" ? "Destructive" : "Action"}</span><b>${esc(summarizeToolCall(tc.name, tc.arguments))}</b></div>
      ${decided === undefined
        ? `<div class="approval-actions"><button class="btn btn-ghost" data-action="deny-tool-call" data-call-id="${tc.id}">Deny</button><button class="btn btn-primary" data-action="approve-tool-call" data-call-id="${tc.id}">Approve</button></div>`
        : `<div class="approval-resolved">${decided ? `${icon("check", 12)} Approved` : `${icon("close", 12)} Denied`}</div>`}
    </div>`;
  }).join("")}${calls.length > 1 ? `<div class="approval-bulk"><button class="text-btn" data-action="deny-all-tool-calls">Deny all</button><button class="text-btn" data-action="approve-all-tool-calls">Approve all</button></div>` : ""}</div>`;
}

function agentPullPanel() {
  const q = state.agentPullQuery.toLowerCase();
  const rows = state.agentPullProjects.filter((p) => p.name.toLowerCase().includes(q));
  return `<input id="agent-pull-search" placeholder="Search your projects…" value="${esc(state.agentPullQuery)}" />
    <div class="agent-pull-list">${state.agentPullLoading
      ? `<div class="field-note"><span class="mini-spinner"></span> Loading…</div>`
      : rows.length
      ? rows.map((p) => `<button class="agent-pull-row" data-action="agent-pull-project" data-id="${esc(p.id)}"><span>${icon("database", 14)}</span><div><b>${esc(p.name)}</b><small>${esc(p.platform || "")} · ${esc(p.status || "")}</small></div></button>`).join("")
      : `<div class="field-note">No saved projects with a stored model found.</div>`}</div>`;
}

function agentAttachPanel() {
  const tabs = [["upload", "Upload file", "upload"], ["paste", "Paste metadata", "file"], ["pull", "Pull a project", "database"]];
  return `<div class="agent-attach-panel">
    <div class="agent-attach-tabs">${tabs.map(([id, label, ic]) => `<button class="${state.agentAttachTab === id ? "selected" : ""}" data-action="agent-attach-tab" data-tab="${id}">${icon(ic, 14)} ${label}</button>`).join("")}</div>
    <div class="agent-attach-body">${
      state.agentAttachTab === "upload" ? `<label class="dropzone small" for="agent-file-input"><input type="file" id="agent-file-input" accept=".bim,.json,.tmdl,.txt" /><div class="drop-icon">${icon("upload", 18)}</div><b>Drop a model file here</b><span>or click to browse · BIM, JSON, TMDL</span>${state.agentBusy ? `<div class="upload-progress"><i></i></div>` : ""}</label>`
      : state.agentAttachTab === "paste" ? `<textarea id="agent-paste-input" class="code-input" placeholder="Paste a .bim/JSON export, TMDL, or describe your model...">${esc(state.agentPasteDraft)}</textarea><div class="inline-actions"><span></span><button class="btn btn-dark" data-action="agent-parse-paste" ${state.agentBusy ? "disabled" : ""}>${state.agentBusy ? '<span class="spinner"></span>' : ""} Attach</button></div>`
      : state.agentAttachTab === "pull" ? agentPullPanel()
      : `<p class="field-note">Choose how to attach a semantic model to this conversation.</p>`
    }</div>
  </div>`;
}

function agentChatPanel() {
  const attached = state.agentModelContext;
  return `<div class="agent-body">
    <div class="agent-thread" id="agent-thread">${state.agentMessages.map(agentMessageRow).join("")}${state.agentBusy && !state.pendingToolCalls ? `<div class="chat-row assistant"><div class="chat-avatar">${icon("spark", 12)}</div><div><div class="bubble"><span class="mini-spinner"></span> Working…</div></div></div>` : ""}${state.pendingToolCalls ? approvalCardsHtml() : ""}</div>
    ${attached ? `<div class="agent-attachment-chip"><span>${icon("file", 13)} ${esc(state.agentModelLabel || "Model attached")}</span><button data-action="agent-clear-attachment" title="Remove">${icon("close", 12)}</button></div>` : ""}
    ${state.agentAttachOpen ? agentAttachPanel() : ""}
    <div class="agent-composer">
      <div class="agent-chips">
        <button data-action="agent-suggest" data-text="What can you help me with?">What can you do?</button>
        <button data-action="agent-suggest" data-text="List my projects.">List my projects</button>
        <button data-action="agent-suggest" data-text="Suggest additional KPIs based on the attached model.">Suggest KPIs</button>
      </div>
      <div class="chat-compose">
        <button class="attach-btn ${state.agentAttachOpen ? "active" : ""}" data-action="toggle-agent-attach" title="Attach a model">${icon("plus", 16)}</button>
        <input id="agent-input" placeholder="Ask SemantIQ anything, or tell it what to do…" value="${esc(state.agentInput)}" ${state.pendingToolCalls ? "disabled" : ""} />
        <button data-action="agent-send" ${state.agentBusy || state.pendingToolCalls ? "disabled" : ""}>${icon("send", 16)}</button>
      </div>
    </div>
  </div>`;
}

const isProviderConnected = (id) => state.apiKeys.some((k) => k.provider === id);

function settingsView() {
  const providers = Object.keys(PROVIDER_META);
  const connected = (id) => state.apiKeys.find((k) => k.provider === id);
  const active = connected(state.settingsTab);
  const meta = PROVIDER_META[state.settingsTab];
  const showForm = !active || state.editingKey;
  const tested = state.testedProvider === state.settingsTab;
  return `<div class="content-narrow">
    <section class="page-intro"><div><div class="eyebrow">ACCOUNT</div><h1>Settings</h1><p>Your profile, AI provider keys, and appearance.</p></div></section>

    <section class="card settings-card">
      <div class="card-title"><div><h3>Profile</h3><p>Signed in with Supabase Auth.</p></div></div>
      <div class="settings-profile-row"><span class="avatar large">${esc(initials(state.user?.email))}</span><div><b>${esc(state.user?.email || "")}</b><small>Member</small></div></div>
      <div class="form-grid"><label>New password<input id="new-password" type="password" placeholder="At least 6 characters" value="${esc(state.newPassword)}" /></label><label>Confirm password<input id="confirm-password" type="password" placeholder="Repeat password" value="${esc(state.confirmPassword)}" /></label></div>
      <div class="inline-actions"><span class="field-note">${icon("lock", 13)} Only used for email/password sign-in.</span><button class="btn btn-dark" data-action="change-password" ${state.passwordBusy ? "disabled" : ""}>${state.passwordBusy ? '<span class="spinner"></span>' : ""} Update password</button></div>
    </section>

    <section class="card settings-card">
      <div class="card-title"><div><h3>AI provider</h3><p>Bring your own key — encrypted at rest, only ever decrypted server-side for your own requests.</p></div></div>
      <div class="source-tabs">${providers.map((p) => `<button class="${state.settingsTab === p ? "selected" : ""}" data-action="settings-tab" data-tab="${p}">${connected(p) ? icon("check", 13) : ""} ${providerLabel(p)}</button>`).join("")}</div>
      <div class="settings-provider-body">${!showForm
        ? `<p class="field-note">${icon("check", 13)} Connected · model ${esc(active.model || meta.model)} · key ${esc(active.masked_key)}</p><div class="inline-actions"><span></span><div class="button-row"><button class="btn btn-ghost" data-action="edit-key">${icon("settings", 13)} Update key</button><button class="btn btn-ghost" data-action="remove-key" data-provider="${state.settingsTab}">${icon("close", 13)} Remove</button></div></div>`
        : `<div class="form-grid">
            <label>API key<input id="key-draft" type="password" placeholder="${meta.placeholder}" value="${esc(state.keyDraft)}" /></label>
            ${tested && state.testedModels.length
              ? `<label>Model<select id="model-draft">${state.testedModels.map((m) => `<option value="${esc(m.id)}" ${(state.modelDraft || "") === m.id ? "selected" : ""}>${esc(m.id)}${m.recommended ? " (Recommended)" : ""}</option>`).join("")}</select></label>`
              : `<label>Model <span class="muted">(test connection to choose)</span><input placeholder="Test connection first" value="" disabled /></label>`}
          </div>
          <a class="provider-key-link" href="${meta.link}" target="_blank" rel="noopener noreferrer">${icon("link", 13)} Get a free ${providerLabel(state.settingsTab)} key at ${meta.linkLabel} ${icon("arrow", 12)}</a>
          <div class="inline-actions">
            <span class="field-note">${tested ? `${icon("check", 13)} Connection verified · ${state.testedModels.length} models available` : "Test your key before saving"}</span>
            <div class="button-row">
              ${active && state.editingKey ? `<button class="btn btn-ghost" data-action="cancel-edit-key">Cancel</button>` : ""}
              <button class="btn btn-dark" data-action="test-key" ${state.keyBusy ? "disabled" : ""}>${state.keyBusy ? '<span class="spinner"></span>' : ""} Test connection</button>
              <button class="btn btn-primary" data-action="save-key" ${(!tested || state.keyBusy) ? "disabled" : ""}>${state.keyBusy ? '<span class="spinner"></span>' : ""} Save key</button>
            </div>
          </div>`
      }</div>
    </section>

    ${connectionsCard()}
  </div>`;
}

function connectionsCard() {
  const platforms = Object.keys(PLATFORM_META);
  const connected = (id) => state.connections.find((c) => c.platform === id);
  const active = connected(state.connectionsTab);
  const meta = PLATFORM_META[state.connectionsTab];
  const showForm = !active || state.editingConnection;
  return `<section class="card settings-card">
    <div class="card-title"><div><h3>Platform connections</h3><p>Read-only credentials for live schema cross-checks — no data rows are ever read or moved.</p></div></div>
    <div class="source-tabs">${platforms.map((p) => `<button class="${state.connectionsTab === p ? "selected" : ""}" data-action="connection-tab" data-tab="${p}">${connected(p) ? icon("check", 13) : ""} ${platformLabel(p)}</button>`).join("")}</div>
    <div class="settings-provider-body">${!state.connectionsLoaded
      ? `<p class="field-note"><span class="mini-spinner"></span> Loading connections…</p>`
      : !showForm
      ? `<p class="field-note">${icon("check", 13)} Connected${active.label ? ` · ${esc(active.label)}` : ""}</p><div class="inline-actions"><span></span><div class="button-row"><button class="btn btn-ghost" data-action="edit-connection">${icon("settings", 13)} Update connection</button><button class="btn btn-ghost" data-action="remove-connection" data-platform="${state.connectionsTab}">${icon("close", 13)} Remove</button></div></div>`
      : `<div class="form-grid">${meta.fields.map((f) => `<label>${f.label}<input data-connection-field="${f.key}" type="${f.type || "text"}" placeholder="${f.placeholder}" value="${esc(state.connectionDraft[f.key] || "")}" /></label>`).join("")}</div>
          <div class="inline-actions">
            <span class="field-note">${state.connectionTested ? `${icon("check", 13)} Connection verified` : "Test your connection before saving"}</span>
            <div class="button-row">
              ${active && state.editingConnection ? `<button class="btn btn-ghost" data-action="cancel-edit-connection">Cancel</button>` : ""}
              <button class="btn btn-dark" data-action="test-connection-cred" ${state.connectionBusy ? "disabled" : ""}>${state.connectionBusy ? '<span class="spinner"></span>' : ""} Test connection</button>
              <button class="btn btn-primary" data-action="save-connection" ${(!state.connectionTested || state.connectionBusy) ? "disabled" : ""}>${state.connectionBusy ? '<span class="spinner"></span>' : ""} Save connection</button>
            </div>
          </div>`
    }</div>
  </section>`;
}

function stepper() {
  const steps = [["Connect", "Power BI source"], ["Context", "Business intake"], ["Platform", "Target schema"], ["Generate", "Review & output"]];
  return `<div class="stepper">${steps.map((step, index) => `<button class="step ${state.step === index + 1 ? "current" : ""} ${state.step > index + 1 ? "done" : ""}" data-action="step" data-step="${index + 1}"><span class="step-number">${state.step > index + 1 ? icon("check", 14) : `0${index + 1}`}</span><span><b>${step[0]}</b><small>${step[1]}</small></span></button>${index < 3 ? `<i class="step-line ${state.step > index + 1 ? "filled" : ""}"></i>` : ""}`).join("")}</div>`;
}

function wizard() {
  return `<div class="content-wide">
    <section class="wizard-heading"><div><button class="back-link" data-action="nav" data-view="dashboard">${icon("back", 15)} Back to projects</button><div class="eyebrow">NEW DOCUMENTATION PROJECT</div><h1>Build your semantic layer brief</h1><p>Four focused steps from source model to decision-ready documentation.</p></div><div class="save-label"><i></i> Autosaved just now</div></section>
    ${stepper()}
    <div class="wizard-body">${state.step === 1 ? sourceStep() : state.step === 2 ? contextStep() : state.step === 3 ? platformStep() : reviewStep()}</div>
  </div>`;
}

function sourceStep() {
  return `<div class="step-heading"><div><span class="step-kicker">STEP 01 / SOURCE</span><h2>Connect your Power BI model</h2><p>Bring in the metadata that gives your documentation its source of truth.</p></div><span class="semantic-key"><i class="dot teal"></i> deterministic operation</span></div>
  <div class="source-tabs">${["live", "upload", "paste"].map((tab) => `<button class="${state.sourceTab === tab ? "selected" : ""}" data-action="source-tab" data-tab="${tab}">${icon(tab === "live" ? "link" : tab === "upload" ? "upload" : "file", 16)}${tab === "live" ? "Live connection" : tab === "upload" ? "Upload file" : "Paste metadata"}</button>`).join("")}</div>
  <div class="source-card">${state.sourceTab === "live" ? livePanel() : state.sourceTab === "upload" ? uploadPanel() : pastePanel()}</div>
  ${state.connected ? schemaPreview() : `<div class="security-note">${icon("settings", 15)} Your model metadata is used only for this documentation project. No data rows are read.</div>`}
  <div class="wizard-footer"><span class="footer-hint">You can change the source before generating.</span><button class="btn btn-primary" ${state.connected ? "" : "disabled"} data-action="next">Continue to business context ${icon("arrow", 15)}</button></div>`;
}

function livePanel() {
  return `<div class="panel-copy"><div class="panel-icon teal-bg">${icon("link", 18)}</div><div><h3>Connect to a Power BI workspace</h3><p>Use a read-only XMLA or REST connection to inspect model metadata.</p></div><span class="connection-badge ${state.connected && state.sourceTab === "live" ? "success" : ""}"><i></i>${state.connected && state.sourceTab === "live" ? "Connected" : "Not connected"}</span></div>
  <div class="form-grid"><label>Workspace URL<input id="workspace-url" value="https://app.powerbi.com/groups/retail-prod" placeholder="https://app.powerbi.com/groups/..." /></label><label>Authentication method<select id="auth-method"><option>XMLA endpoint · read only</option><option>Power BI REST API</option></select></label></div>
  <div class="inline-actions"><span class="field-note">${icon("settings", 13)} Preview only — live Power BI connections aren't wired up yet. Use Upload or Paste for real parsing.</span><button class="btn btn-dark" data-action="test-connection" ${state.busy ? "disabled" : ""}>${state.busy ? '<span class="spinner"></span> Testing...' : "Test connection"} ${icon("arrow", 14)}</button></div>`;
}

function uploadPanel() {
  const parsed = state.sourceTab === "upload" && state.parsedModel;
  return `<div class="panel-copy"><div class="panel-icon teal-bg">${icon("upload", 18)}</div><div><h3>Upload a model file</h3><p>Drop a .bim or JSON model export (e.g. from Tabular Editor), or a TMDL file. We only parse metadata.</p></div></div>
  <label class="dropzone" for="file-input"><input type="file" id="file-input" accept=".bim,.json,.tmdl,.txt" /><div class="drop-icon">${icon("upload", 22)}</div><b>${parsed ? `${state.uploadedFileName} parsed successfully` : "Drop a model file here"}</b><span>${parsed ? `${parsed.tables.length} tables · ${parsed.relationships.length} relationships · ${parsed.measures.length} measures` : "or click to browse · BIM, JSON, TMDL"}</span>${state.busy ? `<div class="upload-progress"><i></i></div>` : ""}</label>
  <div class="inline-actions"><span class="field-note">${icon("file", 13)} Last parsed file: ${parsed ? esc(state.uploadedFileName) : "None yet"}</span><button class="btn btn-dark" data-action="demo-upload" ${state.busy ? "disabled" : ""}>${state.busy ? '<span class="spinner"></span> Parsing...' : "Use sample model"} ${icon("arrow", 14)}</button></div>`;
}

function pastePanel() {
  return `<div class="panel-copy"><div class="panel-icon teal-bg">${icon("file", 18)}</div><div><h3>Paste model metadata</h3><p>Paste a .bim/JSON export, TMDL, DAX measures, or a rough description — we'll interpret it.</p></div></div><textarea id="metadata-input" class="code-input" placeholder='Paste a .bim/JSON export, TMDL text, or describe your model...'>${esc(state.pasteDraft)}</textarea><div class="inline-actions"><span class="field-note">${icon("settings", 13)} Recognized JSON exports parse deterministically; freeform text uses your connected AI provider.</span><button class="btn btn-dark" data-action="validate-metadata" ${state.busy ? "disabled" : ""}>${state.busy ? '<span class="spinner"></span> Parsing...' : "Parse metadata"} ${icon("check", 14)}</button></div>`;
}

function schemaPreview() {
  const parsed = state.parsedModel || { tables: [], relationships: [], measures: [] };
  return `<section class="schema-section"><div class="section-head compact"><div><div class="eyebrow teal-text">PARSED PREVIEW</div><h2>Semantic model structure</h2><p>${parsed.tables.length} tables · ${parsed.relationships.length} relationships · ${parsed.measures.length} measures</p></div><span class="parsed-pill">${icon("check", 13)} Parsed</span></div>
    <div class="schema-grid"><div class="table-list">${parsed.tables.map((table) => `<div class="schema-table ${state.expandedTables.has(table.name) ? "expanded" : ""}"><button class="schema-table-head" data-action="toggle-table" data-table="${table.name}"><span class="table-symbol">${icon("database", 14)}</span><span><b>${esc(table.name)}</b><small>${esc(table.row_count || "row count unknown")}</small></span><span class="table-description">${esc(table.description || "")}</span>${icon("chevron", 15)}</button>${state.expandedTables.has(table.name) ? `<div class="column-list">${table.columns.map((column) => `<div><span class="column-symbol">${column.key ? "◇" : "·"}</span><span class="mono">${esc(column.name)}</span><small>${esc(column.type)}</small></div>`).join("")}</div>` : ""}</div>`).join("") || `<div class="security-note">No tables parsed yet.</div>`}</div>
    <div class="schema-side"><div class="mini-section"><h4>Relationships <span>${String(parsed.relationships.length).padStart(2, "0")}</span></h4>${parsed.relationships.map((relation) => `<div class="relation"><span class="relation-node"></span><div><b>${esc(relation.from)}</b><small>${esc(relation.cardinality)}</small><b>${esc(relation.to)}</b></div></div>`).join("")}</div><div class="mini-section"><h4>Measures & KPIs <span>${String(parsed.measures.length).padStart(2, "0")}</span></h4>${parsed.measures.slice(0, 3).map((measure) => `<div class="measure"><div><b>${esc(measure.name)}</b><small>${esc(measure.description || "")}</small></div><code>${esc(measure.expression)}</code></div>`).join("")}${parsed.measures.length > 3 ? `<button class="subtle-link" data-action="toast" data-message="All measures are included in the generated dictionary.">View all measures ${icon("arrow", 13)}</button>` : ""}</div></div></div></section>`;
}

function contextStep() {
  return `<div class="step-heading"><div><span class="step-kicker">STEP 02 / CONTEXT</span><h2>Give the model its business meaning</h2><p>Capture the decisions, audiences, and boundaries behind the data.</p></div><span class="semantic-key"><i class="dot amber"></i> reasoning input</span></div>
  <div class="context-layout"><div class="context-form card"><div class="card-title"><span class="number-badge amber">01</span><div><h3>Project context</h3><p>These fields become the brief’s north star.</p></div></div><label>Project name<input id="project-name" value="${esc(state.projectName)}" /></label><label>Business objective<textarea id="objective">${esc(state.objective)}</textarea></label><label>Target audience<input id="audience" value="${esc(state.audience)}" /></label><div class="form-grid"><label>In scope<textarea id="scope-in">${esc(state.scopeIn)}</textarea></label><label>Out of scope<textarea id="scope-out">${esc(state.scopeOut)}</textarea></label></div></div>
  <div class="assistant-card card"><div class="assistant-header"><div class="assistant-orb">${icon("spark", 18)}</div><div><h3>Refine with the assistant</h3><p>Turn rough answers into precise documentation language.</p></div><span class="ai-label">AI</span></div>${!state.agentProvider
    ? `<div class="agent-connect small"><b>Connect an AI provider to use this assistant</b><p>Add a key in Settings — the same one your Agent Chat uses.</p><button class="btn btn-primary" data-action="nav" data-view="settings">${icon("settings", 15)} Go to Settings</button></div>`
    : `<div class="chat-thread">${state.chat.length ? state.chat.map((message) => `<div class="chat-row ${message.role}"><div class="chat-avatar">${message.role === "assistant" ? icon("spark", 12) : esc(initials(state.user?.email))}</div><div><div class="bubble">${renderMarkdown(message.text)}</div><small>${message.time}</small></div></div>`).join("") : `<div class="chat-row assistant"><div class="chat-avatar">${icon("spark", 12)}</div><div><div class="bubble">Ask me to sharpen your objective, scope, or audience — I'll ground it in your parsed model.</div></div></div>`}${state.contextChatBusy ? `<div class="chat-row assistant"><div class="chat-avatar">${icon("spark", 12)}</div><div><div class="bubble"><span class="mini-spinner"></span> Thinking…</div></div></div>` : ""}</div><div class="chat-compose"><input id="assistant-input" value="${esc(state.assistantDraft)}" placeholder="Tell the assistant what to clarify..." /><button data-action="send-context-chat" title="Send message" ${state.contextChatBusy ? "disabled" : ""}>${icon("send", 16)}</button></div>`
  }</div></div>
  <div class="wizard-footer"><button class="btn btn-ghost" data-action="prev">${icon("back", 15)} Back</button><button class="btn btn-primary" data-action="next">Continue to target platform ${icon("arrow", 15)}</button></div>`;
}

function platformStep() {
  const platforms = [["Snowflake", "snowflake", "Cloud data warehouse"], ["Databricks", "databricks", "Lakehouse platform"], ["AWS", "aws", "Glue / Redshift"]];
  const slug = state.platform.toLowerCase();
  const connection = state.connections.find((c) => c.platform === slug);
  return `<div class="step-heading"><div><span class="step-kicker">STEP 03 / TARGET</span><h2>Cross-check a target platform</h2><p>Make physical mappings explicit before the documentation is published.</p></div><span class="semantic-key"><i class="dot violet"></i> live connection</span></div>
  <div class="platform-cards">${platforms.map(([name, ps, desc]) => `<button class="platform-card ${state.platform === name ? "selected" : ""}" data-action="platform" data-platform="${name}"><span class="platform-logo ${ps}">${name === "AWS" ? "aws" : name === "Snowflake" ? "❄" : "▦"}</span><span><b>${name}</b><small>${desc}</small></span><span class="radio">${state.platform === name ? icon("check", 12) : ""}</span></button>`).join("")}</div>
  <div class="platform-connection card"><div class="card-title"><span class="number-badge violet">02</span><div><h3>${state.platform} read-only connection</h3><p>We’ll fetch the live catalog and compare names and data types against your model.</p></div><span class="connection-badge ${state.platformChecked ? "success" : ""}"><i></i>${state.platformChecked ? "Cross-check complete" : connection ? "Ready to test" : "Not connected"}</span></div>
  ${connection
    ? `<div class="inline-actions"><span class="field-note">${icon("check", 13)} Using your saved ${platformLabel(slug)} connection${connection.label ? ` · ${esc(connection.label)}` : ""}.</span><button class="btn btn-dark" data-action="test-platform" ${state.busy ? "disabled" : ""}>${state.busy ? '<span class="spinner"></span> Checking live catalog...' : "Test & cross-check schema"} ${icon("arrow", 14)}</button></div>`
    : `<div class="security-note">${icon("settings", 15)} No ${platformLabel(slug)} connection saved yet. <button class="text-btn" data-action="nav" data-view="settings">Add one in Settings ${icon("arrow", 13)}</button></div>`}
  </div>
  ${state.platformChecked && state.crossCheckResult ? mappingPreview() : !connection ? "" : `<div class="security-note">${icon("link", 15)} No data is moved. SemantIQ reads catalog metadata only — table/column names and types.</div>`}
  <div class="wizard-footer"><button class="btn btn-ghost" data-action="prev">${icon("back", 15)} Back</button><button class="btn btn-primary" ${state.platformChecked ? "" : "disabled"} data-action="next">Review & generate ${icon("arrow", 15)}</button></div>`;
}

function mappingPreview() {
  const result = state.crossCheckResult;
  if (!result) return "";
  const rows = result.field_mappings || [];
  return `<section class="mapping-section"><div class="section-head compact"><div><div class="eyebrow violet-text">LIVE CATALOG COMPARISON</div><h2>Integration mapping</h2><p>Power BI semantic names compared with the live ${state.platform} catalog.</p></div><span class="mapping-score"><b>${result.mapped_pct || 0}%</b> mapped</span></div><div class="mapping-table"><div class="mapping-row mapping-head"><span>Power BI field</span><span>Target field</span><span>Status</span></div>${rows.map((f) => `<div class="mapping-row"><span class="mono">${esc(f.source_table)}.${esc(f.source_column)}</span><span class="mono ${f.status === "Missing" ? "missing-text" : ""}">${esc(f.target_table)}.${esc(f.target_column)}</span><span class="mapping-status ${f.status.toLowerCase()}"><i></i>${esc(f.status)}</span></div>`).join("")}</div></section>`;
}

function reviewStep() {
  const stages = ["Extracting model metadata", "Interpreting DAX & suggesting KPIs", "Drafting BRD & FRD", "Building dictionary & platform mapping", "Finalizing documentation set"];
  const tableCount = state.parsedModel?.tables.length ?? 0;
  const measureCount = state.parsedModel?.measures.length ?? 0;
  return `<div class="step-heading"><div><span class="step-kicker">STEP 04 / OUTPUT</span><h2>Review and generate</h2><p>One last look before SemantIQ renders your documentation set.</p></div><span class="semantic-key"><i class="dot amber"></i> generated content</span></div>
  <div class="review-layout"><div class="review-summary card"><div class="card-title"><div><h3>Project summary</h3><p>Everything SemantIQ will use to generate your artifacts.</p></div><button class="subtle-link" data-action="step" data-step="2">Edit context</button></div><div class="summary-block"><span>Project</span><b>${esc(state.projectName)}</b><p>${esc(state.objective)}</p></div><div class="summary-grid"><div><span>Source</span><b>Power BI</b><small>${tableCount} tables · ${measureCount} measures</small></div><div><span>Target</span><b>${state.platform}</b><small>${state.platformChecked ? "Schema cross-checked" : "Metadata only"}</small></div><div><span>Audience</span><b>${esc(state.audience.split(",")[0])}</b><small>+ ${Math.max(0, state.audience.split(",").length - 1)} stakeholder groups</small></div><div><span>Artifacts</span><b>04 files</b><small>BRD · FRD · Dictionary · Mapping</small></div></div><div class="review-checks"><div><span class="check-square">${icon("check", 12)}</span> Source metadata parsed</div><div><span class="check-square">${icon("check", 12)}</span> Business context captured</div><div><span class="check-square violet-check">${icon("check", 12)}</span> ${state.platform} selected</div>${!state.agentProvider ? `<div class="footer-hint">${icon("settings", 12)} Connect an AI provider in Settings before generating.</div>` : ""}</div></div>
  <div class="generate-card card">${state.generated ? `<div class="generated-done"><div class="done-ring">${icon("check", 27)}</div><span class="eyebrow">GENERATION COMPLETE</span><h3>Your documentation set is ready.</h3><p>Four artifacts were rendered by the AI agent from your model and business context.</p><button class="btn btn-primary" data-action="view-results">Open results workspace ${icon("arrow", 15)}</button></div>` : `<div class="generate-copy"><div class="generate-orb">${icon("spark", 20)}</div><span class="eyebrow amber-text">READY TO GENERATE</span><h3>Render the complete documentation set</h3><p>SemantIQ's agents will interpret the model and draft decision-ready artifacts — this genuinely calls your connected AI provider, so it may take up to a minute.</p><button class="btn btn-primary full" data-action="generate" ${state.busy || !state.agentProvider ? "disabled" : ""}>${state.busy ? '<span class="spinner"></span> Generating...' : "Generate documentation"} ${icon("spark", 15)}</button></div>`}<div class="pipeline">${stages.map((stage, index) => `<div class="pipeline-stage ${state.pipeline === index ? "running" : ""} ${state.pipeline > index || state.generated ? "complete" : ""}"><span>${state.pipeline > index || state.generated ? icon("check", 13) : state.pipeline === index ? '<span class="mini-spinner"></span>' : `0${index + 1}`}</span><label>${stage}</label><small>${state.pipeline === index ? "Working…" : state.pipeline > index || state.generated ? "Complete" : "Waiting"}</small></div>`).join("")}</div></div></div>
  <div class="wizard-footer"><button class="btn btn-ghost" data-action="prev">${icon("back", 15)} Back</button><span class="footer-hint">${state.platformChecked ? "All checks passed. Ready when you are." : "You can generate without a target schema check."}</span></div>`;
}

function suggestedKpisPanel() {
  if (!state.suggestedKpis.length) return "";
  return `<section class="kpi-suggestions"><div class="section-head compact"><div><div class="eyebrow amber-text">AI SUGGESTED</div><h2>Additional KPIs worth considering</h2><p>Generated from your model — not yet part of the official measure set.</p></div></div>
    <div class="kpi-suggestion-grid">${state.suggestedKpis.map((kpi) => `<div class="kpi-suggestion-card"><b>${esc(kpi.name)}</b><p>${esc(kpi.rationale)}</p><code>${esc(kpi.expression)}</code></div>`).join("")}</div></section>`;
}

function results() {
  const tabs = [["brd", "BRD preview", "Business requirements"], ["frd", "FRD preview", "Functional requirements"], ["dictionary", "Semantic dictionary", "Source definitions"], ["mapping", "Integration mapping", "Platform comparison"]];
  return `<div class="results-shell"><section class="results-heading"><div><button class="back-link" data-action="nav" data-view="dashboard">${icon("back", 15)} Back to projects</button><div class="eyebrow">DOCUMENTATION SET · GENERATED TODAY</div><h1>${esc(state.projectName)}</h1><p>Power BI → ${state.platform} <span class="separator">·</span> Version 1.0 <span class="separator">·</span> <span class="status-pill ready"><i></i> Ready</span></p></div><div class="result-actions">${state.parsedModel ? `<button class="btn btn-ghost" data-action="toggle-source-model">${icon("database", 15)} ${state.showSourceModel ? "Hide" : "View"} source model</button>` : ""}${state.sourceFilePath ? `<button class="btn btn-ghost" data-action="download-source-file">${icon("download", 15)} Original file</button>` : ""}${state.parsedModel ? `<button class="btn btn-ghost" data-action="reuse-model">${icon("plus", 15)} New project from this model</button>` : ""}<button class="btn btn-ghost" data-action="share-project" ${state.shareBusy ? "disabled" : ""}>${state.shareBusy ? '<span class="spinner"></span>' : icon("link", 15)} Share</button><button class="btn btn-primary" data-action="download-all">${icon("download", 15)} Download all</button></div></section>
    ${suggestedKpisPanel()}
    ${state.showSourceModel ? schemaPreview() : ""}
    <div class="result-grid"><section class="document-area"><div class="result-tabs">${tabs.map(([id, label, sub]) => `<button class="${state.resultTab === id ? "active" : ""}" data-action="result-tab" data-tab="${id}"><b>${label}</b><small>${sub}</small></button>`).join("")}</div><div class="doc-toolbar"><span><i class="dot ${state.resultTab === "mapping" ? "violet" : state.resultTab === "brd" || state.resultTab === "frd" ? "amber" : "teal"}"></i> Generated artifact <b>·</b> autosaved</span><button class="download-link" data-action="download-current">${icon("download", 14)} Download ${state.resultTab === "brd" ? "BRD.docx" : state.resultTab === "frd" ? "FRD.docx" : state.resultTab === "dictionary" ? "Semantic_Layer_Dictionary.xlsx" : "Integration_Mapping_Report.xlsx"}</button></div><article class="document-preview">${documentContent()}</article></section>${documentChat()}</div>
  </div>`;
}

function docTable(headers, rows) {
  if (!rows.length) return "";
  return `<div class="project-table-wrap"><table class="project-table"><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function priorityBadge(p) {
  const cls = p === "Must" ? "missing" : p === "Should" ? "renamed" : "";
  return `<span class="mapping-status ${cls}"><i></i>${esc(p || "—")}</span>`;
}

function statusBadge(status) {
  const cls = status === "Renamed" ? "renamed" : status === "Missing" ? "missing" : "";
  return `<span class="mapping-status ${cls}"><i></i>${esc(status || "—")}</span>`;
}

function brdBody(doc) {
  const objectives = doc.objectives || [];
  const stakeholders = doc.stakeholders || [];
  const requirements = doc.requirements || [];
  const risks = doc.risks || [];
  const glossary = doc.glossary || [];
  const themes = [...new Set(requirements.map((r) => r.theme || "General"))];
  return `
    <section><h3>01 / Executive summary</h3><p>${esc(doc.executive_summary || "")}</p></section>
    <section><h3>02 / Business background</h3><p>${esc(doc.business_background || "")}</p></section>
    <section><h3>03 / Business objectives</h3>${docTable(["ID", "Objective", "Success metric"], objectives.map((o) => [esc(o.id), esc(o.statement), esc(o.success_metric)]))}</section>
    <section><h3>04 / Stakeholders</h3>${docTable(["Role", "Responsibility", "Interest"], stakeholders.map((s) => [esc(s.role), esc(s.responsibility), esc(s.interest)]))}</section>
    <section><h3>05 / Current state</h3><p>${esc(doc.current_state || "")}</p></section>
    <section><h3>06 / Future state</h3><p>${esc(doc.future_state || "")}</p></section>
    <section><h3>07 / In scope</h3><p>${(doc.in_scope || []).map(esc).join("<br />")}</p></section>
    <section><h3>08 / Out of scope</h3><p>${(doc.out_of_scope || []).map(esc).join("<br />")}</p></section>
    ${themes.map((theme) => `<section><h3>Requirements · ${esc(theme)}</h3>${docTable(["ID", "Requirement", "Priority", "Rationale"], requirements.filter((r) => (r.theme || "General") === theme).map((r) => [esc(r.id), esc(r.description), priorityBadge(r.priority), esc(r.rationale)]))}</section>`).join("")}
    <section><h3>09 / Assumptions</h3><p>${(doc.assumptions || []).map(esc).join("<br />")}</p></section>
    <section><h3>10 / Constraints</h3><p>${(doc.constraints || []).map(esc).join("<br />")}</p></section>
    <section><h3>11 / Risks & mitigations</h3>${docTable(["Risk", "Impact", "Mitigation"], risks.map((r) => [esc(r.risk), esc(r.impact), esc(r.mitigation)]))}</section>
    <section><h3>12 / Success criteria</h3><p>${(doc.success_criteria || []).map(esc).join("<br />")}</p></section>
    <section><h3>13 / Glossary</h3>${docTable(["Term", "Definition"], glossary.map((g) => [esc(g.term), esc(g.definition)]))}</section>`;
}

function frdBody(doc) {
  const modules = doc.modules || [];
  const nfr = doc.non_functional_requirements || [];
  const dataReqs = doc.data_requirements || [];
  const traceability = doc.traceability || [];
  return `
    <section><h3>01 / Introduction</h3><p>${esc(doc.introduction || "")}</p></section>
    <section><h3>02 / System overview</h3><p>${esc(doc.system_overview || "")}</p></section>
    <section><h3>03 / Functional modules</h3>${modules.map((m, i) => `<div class="frd-module"><b>Module ${i + 1} · ${esc(m.name)}</b><p>${esc(m.description || "")}</p>${(m.stories || []).map((s) => `<div class="frd-story"><p><code>${esc(s.id)}</code> ${esc(s.story)} ${priorityBadge(s.priority)}</p><ul>${(s.acceptance_criteria || []).map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>`).join("")}</div>`).join("")}</section>
    <section><h3>04 / Non-functional requirements</h3>${docTable(["Category", "Requirement"], nfr.map((n) => [esc(n.category), esc(n.requirement)]))}</section>
    <section><h3>05 / Data requirements</h3>${docTable(["Entity", "Fields", "Notes"], dataReqs.map((d) => [esc(d.entity), esc((d.fields || []).join(", ")), esc(d.notes)]))}</section>
    <section><h3>06 / Traceability matrix</h3>${docTable(["Business requirement", "Functional requirement"], traceability.map((t) => [esc(t.business_requirement), esc(t.functional_requirement)]))}</section>`;
}

function dictionaryBody(doc) {
  const tables = doc.tables || [];
  const relationships = doc.relationships || [];
  const measures = doc.measures || [];
  const glossary = doc.glossary || [];
  const summary = doc.summary || {};
  return `
    <section><h3>Overview</h3><p>${summary.tables || 0} tables · ${summary.columns || 0} columns · ${summary.measures || 0} measures · ${summary.relationships || 0} relationships</p></section>
    ${tables.map((t) => `<section><h3>${esc(t.name)}</h3><p>${esc(t.purpose || "")}</p>${docTable(["Column", "Type", "Key", "Description"], (t.columns || []).map((c) => [`<span class="mono">${esc(c.name)}</span>`, esc(c.type), c.key ? "◇" : "", esc(c.description)]))}</section>`).join("")}
    <section><h3>Relationships</h3>${docTable(["From", "To", "Cardinality"], relationships.map((r) => [esc(r.from), esc(r.to), esc(r.cardinality)]))}</section>
    <section><h3>Measures & KPIs</h3>${docTable(["Measure", "DAX expression", "Description"], measures.map((m) => [esc(m.name), `<code>${esc(m.expression)}</code>`, esc(m.description)]))}</section>
    <section><h3>Glossary</h3>${docTable(["Term", "Definition"], glossary.map((g) => [esc(g.term), esc(g.definition)]))}</section>`;
}

function mappingDocBody(doc) {
  const summary = doc.summary || {};
  const tableMappings = doc.table_mappings || [];
  const fieldMappings = doc.field_mappings || [];
  const relMappings = doc.relationship_mappings || [];
  const measureMappings = doc.measure_mappings || [];
  return `
    <section><h3>Summary</h3><p>${doc.mapped_pct || 0}% mapped (matched + renamed) across ${summary.total || 0} fields — ${summary.matched || 0} matched, ${summary.renamed || 0} renamed, ${summary.missing || 0} need review. Estimate pending a real catalog comparison.</p></section>
    <section><h3>Table mapping</h3>${docTable(["Source table", "Target table", "Type"], tableMappings.map((t) => [esc(t.source_table), `<span class="mono">${esc(t.target_table)}</span>`, esc(t.type)]))}</section>
    <section><h3>Field mapping</h3>${docTable(["Source", "Target", "Status", "Note"], fieldMappings.map((f) => [`<span class="mono">${esc(f.source_table)}.${esc(f.source_column)}</span>`, `<span class="mono">${esc(f.target_table)}.${esc(f.target_column)}</span>`, statusBadge(f.status), esc(f.note)]))}</section>
    <section><h3>Relationship mapping</h3>${docTable(["Source", "Target join", "Cardinality"], relMappings.map((r) => [esc(r.source), `<span class="mono">${esc(r.target_join)}</span>`, esc(r.cardinality)]))}</section>
    <section><h3>Measure mapping</h3>${docTable(["Measure", "Source DAX", "Note"], measureMappings.map((m) => [esc(m.measure), `<code>${esc(m.dax)}</code>`, esc(m.note)]))}</section>`;
}

function documentContent() {
  const docs = state.documents || {};
  const doc = docs[state.resultTab];
  if (!doc) return `<div class="security-note">This document hasn't been generated yet.</div>`;
  const body =
    state.resultTab === "brd" ? brdBody(doc) :
    state.resultTab === "frd" ? frdBody(doc) :
    state.resultTab === "dictionary" ? dictionaryBody(doc) :
    mappingDocBody(doc);
  return `<div class="doc-cover"><div class="doc-brand"><span class="brand-mark small"><span></span><span></span><span></span></span><b>SemantIQ</b></div><span class="doc-type">${esc(doc.kicker)}</span><h2>${esc(doc.label)}</h2><h1>${esc(doc.title)}</h1><p>Prepared from <b>${esc(state.sourceLabel || "the connected source model")}</b> and business context captured on ${esc(state.generatedDate || new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }))}.</p></div><div class="doc-body">${body}<div class="doc-note"><span class="amber-note">${icon("spark", 14)}</span><div><b>Generated interpretation</b><p>This section was synthesized from model metadata and the documented business objective. Review before external distribution.</p></div></div></div>`;
}

function documentChat() {
  if (!state.agentProvider) {
    return `<aside class="document-chat"><div class="doc-chat-head"><div class="assistant-orb">${icon("spark", 16)}</div><div><h3>Ask about this document</h3><small>Context-aware assistant</small></div></div><div class="agent-connect small"><b>Connect an AI provider to ask questions</b><p>Add a key in Settings — the same one your Agent Chat uses.</p><button class="btn btn-primary" data-action="nav" data-view="settings">${icon("settings", 15)} Go to Settings</button></div></aside>`;
  }
  return `<aside class="document-chat"><div class="doc-chat-head"><div class="assistant-orb">${icon("spark", 16)}</div><div><h3>Ask about this document</h3><small>Context-aware assistant</small></div></div><div class="doc-chat-thread">${state.documentChat.length ? state.documentChat.map((message) => `<div class="chat-row ${message.role}"><div class="chat-avatar">${message.role === "assistant" ? icon("spark", 12) : esc(initials(state.user?.email))}</div><div><div class="bubble">${renderMarkdown(message.text)}</div><small>${message.time}</small></div></div>`).join("") : `<div class="chat-row assistant"><div class="chat-avatar">${icon("spark", 12)}</div><div><div class="bubble">Your documentation set is ready. Ask me about a definition, requirement, or mapping decision.</div></div></div>`}${state.documentChatBusy ? `<div class="chat-row assistant"><div class="chat-avatar">${icon("spark", 12)}</div><div><div class="bubble"><span class="mini-spinner"></span> Thinking…</div></div></div>` : ""}</div><div class="suggestion-list"><button data-action="suggestion" data-text="Summarize this document in three sentences.">Summarize this document</button><button data-action="suggestion" data-text="What's out of scope, and why?">What's out of scope?</button><button data-action="suggestion" data-text="Which item here needs the most manual review, and why?">What needs review?</button></div><div class="chat-compose"><input id="document-chat-input" placeholder="Ask or request a change…" ${state.documentChatBusy ? "disabled" : ""} /><button data-action="send-document-chat" ${state.documentChatBusy ? "disabled" : ""}>${icon("send", 16)}</button></div><div class="chat-foot">SemantIQ can suggest changes; you stay in control.</div></aside>`;
}

function toast(message) {
  state.toast = message;
  render();
  setTimeout(() => { if (state.toast === message) { state.toast = null; render(); } }, 2600);
}

function applySession(session, user) {
  const authedUser = user || session?.user || null;
  state.user = authedUser ? { email: authedUser.email, id: authedUser.id } : null;
  if (state.user && state.view === "login") state.view = "chat";
  render();
  if (state.view === "dashboard") paintProjects();
  if (state.view === "chat" || state.view === "settings") loadApiKeys();
  if (state.view === "settings" || state.view === "wizard") loadConnections();
}

async function loadApiKeys() {
  try {
    state.apiKeys = await listApiKeys();
  } catch (error) {
    toast(error.message || "Could not load API keys.");
    state.apiKeys = [];
  }
  state.apiKeysLoaded = true;
  if (!state.agentProvider && state.apiKeys.length) state.agentProvider = state.apiKeys[0].provider;
  render();
}

async function loadConnections() {
  try {
    state.connections = await listConnections();
  } catch (error) {
    toast(error.message || "Could not load platform connections.");
    state.connections = [];
  }
  state.connectionsLoaded = true;
  render();
}

async function sendAgentMessage(text) {
  const trimmed = (text || "").trim();
  if (!trimmed || state.agentBusy || !state.agentProvider || state.pendingToolCalls) return;
  state.agentMessages.push({ role: "user", content: trimmed });
  state.agentHistory.push({ role: "user", content: trimmed });
  state.agentInput = "";
  state.agentBusy = true;
  render();
  await runAgentLoop();
  state.agentBusy = false;
  render();
  await persistConversation();
}

function autoTitle() {
  const firstUser = state.agentMessages.find((m) => m.role === "user");
  if (firstUser && firstUser.content) {
    const trimmedText = firstUser.content.trim();
    return trimmedText.length > 60 ? `${trimmedText.slice(0, 60)}…` : trimmedText;
  }
  return `Chat — ${new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

async function persistConversation() {
  if (state.agentMessages.filter((m) => m.role === "user").length === 0) return;
  try {
    if (!state.agentConversationId) {
      const saved = await createConversation({
        title: autoTitle(), messages: state.agentMessages, history: state.agentHistory,
        modelContext: state.agentModelContext, modelLabel: state.agentModelLabel
      });
      state.agentConversationId = saved.id;
    } else {
      await updateConversation(state.agentConversationId, {
        messages: state.agentMessages, history: state.agentHistory,
        modelContext: state.agentModelContext, modelLabel: state.agentModelLabel
      });
    }
    state.agentConversationsLoaded = false;
  } catch (error) {
    console.error("Autosave failed:", error);
  }
}

async function loadAgentConversations() {
  try {
    state.agentConversations = await listConversations();
  } catch (error) {
    toast(error.message || "Could not load saved chats.");
  }
  state.agentConversationsLoaded = true;
  render();
}

async function withBusy(task, busyKey = "busy") {
  state[busyKey] = true;
  render();
  try { await task(); } catch (error) { toast(error.message || "Something went wrong. Please try again."); }
  state[busyKey] = false;
  render();
}

function readContext() {
  state.projectName = document.querySelector("#project-name")?.value || state.projectName;
  state.objective = document.querySelector("#objective")?.value || state.objective;
  state.audience = document.querySelector("#audience")?.value || state.audience;
  state.scopeIn = document.querySelector("#scope-in")?.value || state.scopeIn;
  state.scopeOut = document.querySelector("#scope-out")?.value || state.scopeOut;
}

function bindActionElements(root) {
  root.querySelectorAll("[data-action]").forEach((element) => element.addEventListener("click", handleAction));
}

function bindEvents() {
  bindActionElements(document);
  document.querySelector("#file-input")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      withBusy(async () => {
        const result = await parseMetadata({ raw: String(reader.result || ""), provider: state.agentProvider });
        state.parsedModel = result;
        state.uploadedFileName = file.name;
        state.uploadedFileBlob = file;
        state.connected = true;
        state.expandedTables = new Set(result.tables[0] ? [result.tables[0].name] : []);
        toast(`${file.name} parsed successfully`);
      });
    };
    reader.onerror = () => toast("Could not read that file.");
    reader.readAsText(file);
  });
  document.querySelector("#metadata-input")?.addEventListener("input", (event) => { state.pasteDraft = event.target.value; });
  document.querySelector("#project-search")?.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    document.querySelectorAll("#projects-body tr").forEach((row) => { row.hidden = !row.dataset.project.includes(query); });
  });
  document.querySelector("#assistant-input")?.addEventListener("input", (event) => { state.assistantDraft = event.target.value; });
  document.querySelector("#project-name")?.addEventListener("input", (event) => { state.projectName = event.target.value; });
  document.querySelector("#objective")?.addEventListener("input", (event) => { state.objective = event.target.value; });
  document.querySelector("#audience")?.addEventListener("input", (event) => { state.audience = event.target.value; });
  document.querySelector("#scope-in")?.addEventListener("input", (event) => { state.scopeIn = event.target.value; });
  document.querySelector("#scope-out")?.addEventListener("input", (event) => { state.scopeOut = event.target.value; });
  document.querySelector("#auth-email")?.addEventListener("input", (event) => { state.authEmail = event.target.value; });
  document.querySelector("#auth-password")?.addEventListener("input", (event) => { state.authPassword = event.target.value; });
  document.querySelector("#document-chat-input")?.addEventListener("keydown", (event) => { if (event.key === "Enter") handleAction({ currentTarget: { dataset: { action: "send-document-chat" } } }); });
  document.querySelector("#agent-input")?.addEventListener("input", (event) => { state.agentInput = event.target.value; });
  document.querySelector("#agent-input")?.addEventListener("keydown", (event) => { if (event.key === "Enter") handleAction({ currentTarget: { dataset: { action: "agent-send" } } }); });
  document.querySelector("#agent-provider-select")?.addEventListener("change", (event) => { state.agentProvider = event.target.value; });
  document.querySelector("#agent-paste-input")?.addEventListener("input", (event) => { state.agentPasteDraft = event.target.value; });
  document.querySelector("#agent-pull-search")?.addEventListener("input", (event) => { state.agentPullQuery = event.target.value; render(); });
  document.querySelector("#agent-file-input")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      withBusy(async () => {
        try {
          const result = await parseMetadata({ raw: String(reader.result || ""), provider: state.agentProvider });
          state.agentModelContext = result;
          state.agentModelLabel = file.name;
          state.agentAttachOpen = false;
          toast(`${file.name} attached to this conversation.`);
        } catch (error) {
          toast(error.message || "Could not parse that file.");
        }
      });
    };
    reader.onerror = () => toast("Could not read that file.");
    reader.readAsText(file);
  });
  document.querySelector("#key-draft")?.addEventListener("input", (event) => { state.keyDraft = event.target.value; });
  document.querySelector("#model-draft")?.addEventListener("input", (event) => { state.modelDraft = event.target.value; });
  document.querySelector("#model-draft")?.addEventListener("change", (event) => { state.modelDraft = event.target.value; });
  document.querySelector("#new-password")?.addEventListener("input", (event) => { state.newPassword = event.target.value; });
  document.querySelector("#confirm-password")?.addEventListener("input", (event) => { state.confirmPassword = event.target.value; });
  document.querySelectorAll("[data-connection-field]").forEach((input) => {
    input.addEventListener("input", (event) => { state.connectionDraft[event.target.dataset.connectionField] = event.target.value; });
  });
  const thread = document.querySelector("#agent-thread");
  if (thread) thread.scrollTop = thread.scrollHeight;

  if (document.querySelector(".mermaid")) {
    mermaid.run({ querySelector: ".mermaid" }).catch(() => {});
  }
}

async function handleAction(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  if (action === "auth-mode") {
    state.authMode = target.dataset.mode; render();
  } else if (action === "auth-toggle-password") {
    state.authShowPassword = !state.authShowPassword; render();
  } else if (action === "auth-submit") {
    const email = state.authEmail.trim();
    const password = state.authPassword;
    if (!email || !password) { toast("Enter an email and password."); return; }
    await withBusy(async () => {
      if (state.authMode === "signin") {
        const { session, user } = await signInWithEmail(email, password);
        applySession(session, user);
        toast("Signed in");
      } else {
        const { session, user } = await signUpWithEmail(email, password);
        if (session) {
          applySession(session, user);
          toast("Account created — welcome to SemantIQ");
        } else {
          state.authMode = "signin"; state.authPassword = "";
          toast("Check your email to confirm your account, then sign in.");
        }
      }
    });
  } else if (action === "auth-google" || action === "auth-github") {
    await withBusy(async () => { await signInWithOAuth(action === "auth-google" ? "google" : "github"); });
  } else if (action === "sign-out") {
    await withBusy(async () => {
      await signOut();
      state.user = null; state.view = "login"; state.authEmail = ""; state.authPassword = "";
      state.currentProjectId = null; state.documents = null; state.generated = false; state.pipeline = -1;
      state.apiKeys = []; state.apiKeysLoaded = false; state.agentProvider = null;
      state.connections = []; state.connectionsLoaded = false;
      state.projectsCache = []; state.projectsCacheLoaded = false;
      state.agentConversations = []; state.agentConversationsLoaded = false; state.agentConversationId = null;
      state.agentModelContext = null; state.agentModelLabel = ""; state.agentAttachOpen = false; state.agentAttachTab = null;
      state.agentHistory = []; state.pendingToolCalls = null; state.pendingDecisions = {}; state.agentProjectNames = {};
      state.agentMessages = [{ role: "assistant", content: "Hi, I'm the SemantIQ agent. I can explain a model, generate a full documentation project, edit or regenerate an existing one, create a share link, or take you anywhere in the app — attach a model with the + button, or ask me to pull one of your saved projects. What would you like to do?" }];
      toast("Signed out");
    });
  } else if (action === "agent-send") {
    const input = document.querySelector("#agent-input");
    await sendAgentMessage(input?.value);
  } else if (action === "agent-suggest") {
    await sendAgentMessage(target.dataset.text);
  } else if (action === "agent-mode") {
    state.agentMode = target.dataset.mode; render();
  } else if (action === "toggle-agent-attach") {
    state.agentAttachOpen = !state.agentAttachOpen;
    if (state.agentAttachOpen && !state.agentAttachTab) state.agentAttachTab = "upload";
    render();
  } else if (action === "agent-attach-tab") {
    state.agentAttachTab = target.dataset.tab;
    if (state.agentAttachTab === "pull" && !state.agentPullProjects.length) {
      state.agentPullLoading = true; render();
      listProjects().then((rows) => {
        state.agentPullProjects = rows.filter((p) => p.model_snapshot);
        state.agentPullLoading = false; render();
      }).catch((error) => { state.agentPullLoading = false; toast(error.message || "Could not load projects."); render(); });
    }
    render();
  } else if (action === "agent-clear-attachment") {
    state.agentModelContext = null; state.agentModelLabel = ""; render();
  } else if (action === "agent-parse-paste") {
    const raw = document.querySelector("#agent-paste-input")?.value.trim();
    if (!raw) { toast("Paste something to parse first."); return; }
    state.agentPasteDraft = raw;
    await withBusy(async () => {
      try {
        const result = await parseMetadata({ raw, provider: state.agentProvider });
        state.agentModelContext = result;
        state.agentModelLabel = "pasted metadata";
        state.agentAttachOpen = false;
        toast("Model attached to this conversation.");
      } catch (error) {
        toast(error.message || "Could not parse that.");
      }
    });
  } else if (action === "agent-pull-project") {
    const id = target.closest("[data-id]")?.dataset.id;
    if (!id) return;
    await withBusy(async () => {
      try {
        const { project } = await getProjectWithDocuments(id);
        if (!project.model_snapshot) { toast("This project has no saved model to pull."); return; }
        state.agentModelContext = project.model_snapshot;
        state.agentModelLabel = project.name;
        state.agentProjectNames[project.id] = project.name;
        state.agentAttachOpen = false;
        toast(`Attached model from "${project.name}".`);
      } catch (error) {
        toast(error.message || "Could not load that project.");
      }
    });
  } else if (action === "approve-tool-call") {
    state.pendingDecisions[target.dataset.callId] = true;
    maybeResolvePending();
  } else if (action === "deny-tool-call") {
    state.pendingDecisions[target.dataset.callId] = false;
    maybeResolvePending();
  } else if (action === "approve-all-tool-calls") {
    const decisions = {};
    (state.pendingToolCalls || []).forEach((tc) => { decisions[tc.id] = true; });
    resolveApproval(decisions);
  } else if (action === "deny-all-tool-calls") {
    const decisions = {};
    (state.pendingToolCalls || []).forEach((tc) => { decisions[tc.id] = false; });
    resolveApproval(decisions);
  } else if (action === "toggle-agent-memory") {
    state.agentMemoryOpen = !state.agentMemoryOpen;
    if (state.agentMemoryOpen && !state.agentConversationsLoaded) loadAgentConversations();
    render();
  } else if (action === "agent-new-chat") {
    state.agentConversationId = null;
    state.agentMessages = [{ role: "assistant", content: "Hi, I'm the SemantIQ agent. I can explain a model, generate a full documentation project, edit or regenerate an existing one, create a share link, or take you anywhere in the app — attach a model with the + button, or ask me to pull one of your saved projects. What would you like to do?" }];
    state.agentHistory = [];
    state.agentModelContext = null; state.agentModelLabel = "";
    state.agentAttachOpen = false; state.agentAttachTab = null;
    state.pendingToolCalls = null; state.pendingDecisions = {};
    render();
  } else if (action === "agent-save-chat") {
    const currentTitle = state.agentConversations.find((c) => c.id === state.agentConversationId)?.title || autoTitle();
    const name = window.prompt("Save this chat as:", currentTitle);
    if (name === null) return;
    await withBusy(async () => {
      if (!state.agentConversationId) {
        const saved = await createConversation({
          title: name.trim() || autoTitle(), messages: state.agentMessages, history: state.agentHistory,
          modelContext: state.agentModelContext, modelLabel: state.agentModelLabel
        });
        state.agentConversationId = saved.id;
      } else {
        await updateConversation(state.agentConversationId, { title: name.trim() || autoTitle() });
      }
      toast("Chat saved.");
      state.agentConversationsLoaded = false;
      if (state.agentMemoryOpen) await loadAgentConversations();
    }, "agentSaveBusy");
  } else if (action === "open-agent-conversation") {
    const id = target.dataset.id;
    await withBusy(async () => {
      try {
        const convo = await getConversation(id);
        state.agentConversationId = convo.id;
        state.agentMessages = convo.messages && convo.messages.length ? convo.messages : [{ role: "assistant", content: "Continuing this chat." }];
        state.agentHistory = convo.history || [];
        state.agentModelContext = convo.model_context || null;
        state.agentModelLabel = convo.model_label || "";
        state.agentAttachOpen = false; state.pendingToolCalls = null; state.pendingDecisions = {};
        state.agentMemoryOpen = false;
      } catch (error) {
        toast(error.message || "Could not open that chat.");
      }
    });
  } else if (action === "delete-agent-conversation") {
    const id = target.dataset.id;
    if (!window.confirm("Delete this saved chat? This can't be undone.")) return;
    await withBusy(async () => {
      try {
        await deleteConversation(id);
        if (state.agentConversationId === id) {
          state.agentConversationId = null; state.agentHistory = [];
          state.agentMessages = [{ role: "assistant", content: "Hi, I'm the SemantIQ agent. What would you like to do?" }];
        }
        await loadAgentConversations();
      } catch (error) {
        toast(error.message || "Could not delete that chat.");
      }
    });
  } else if (action === "settings-tab") {
    state.settingsTab = target.dataset.tab; state.keyDraft = ""; state.modelDraft = "";
    state.testedModels = []; state.testedProvider = null; state.editingKey = false;
    render();
  } else if (action === "edit-key") {
    state.editingKey = true; state.keyDraft = ""; state.modelDraft = "";
    state.testedModels = []; state.testedProvider = null;
    render();
  } else if (action === "cancel-edit-key") {
    state.editingKey = false; state.keyDraft = ""; state.modelDraft = "";
    state.testedModels = []; state.testedProvider = null;
    render();
  } else if (action === "test-key") {
    const apiKey = document.querySelector("#key-draft")?.value.trim();
    if (!apiKey) { toast("Enter an API key first."); return; }
    const provider = state.settingsTab;
    await withBusy(async () => {
      const result = await testApiKey({ provider, apiKey });
      state.testedModels = result.models;
      state.testedProvider = provider;
      state.modelDraft = result.recommended || result.models[0]?.id || "";
      toast(`Connected — ${result.models.length} model${result.models.length === 1 ? "" : "s"} available`);
    }, "keyBusy");
  } else if (action === "save-key") {
    if (state.testedProvider !== state.settingsTab) { toast("Test the connection first."); return; }
    const apiKey = document.querySelector("#key-draft")?.value.trim();
    const model = document.querySelector("#model-draft")?.value.trim();
    const overwriting = isProviderConnected(state.settingsTab);
    if (overwriting && !window.confirm(`Replace your saved ${providerLabel(state.settingsTab)} key with this new one?`)) return;
    await withBusy(async () => {
      await saveApiKey({ provider: state.settingsTab, apiKey, model });
      state.keyDraft = ""; state.modelDraft = ""; state.testedModels = []; state.testedProvider = null; state.editingKey = false;
      toast(`${providerLabel(state.settingsTab)} key saved`);
      await loadApiKeys();
    }, "keyBusy");
  } else if (action === "remove-key") {
    const provider = target.dataset.provider;
    if (!window.confirm(`Remove your saved ${providerLabel(provider)} key? You'll need to add it again to use this provider.`)) return;
    await withBusy(async () => {
      await deleteApiKey(provider);
      if (state.agentProvider === provider) state.agentProvider = null;
      toast(`${providerLabel(provider)} key removed`);
      await loadApiKeys();
    }, "keyBusy");
  } else if (action === "connection-tab") {
    state.connectionsTab = target.dataset.tab; state.connectionDraft = {};
    state.connectionTested = false; state.editingConnection = false;
    render();
  } else if (action === "edit-connection") {
    state.editingConnection = true; state.connectionDraft = {}; state.connectionTested = false;
    render();
  } else if (action === "cancel-edit-connection") {
    state.editingConnection = false; state.connectionDraft = {}; state.connectionTested = false;
    render();
  } else if (action === "test-connection-cred") {
    const platform = state.connectionsTab;
    await withBusy(async () => {
      try {
        await testConnection({ platform, config: state.connectionDraft });
        state.connectionTested = true;
        toast(`${platformLabel(platform)} connection verified`);
      } catch (error) {
        state.connectionTested = false;
        toast(error.message || "Connection test failed.");
      }
    }, "connectionBusy");
  } else if (action === "save-connection") {
    if (!state.connectionTested) { toast("Test the connection first."); return; }
    const platform = state.connectionsTab;
    const overwriting = isPlatformConnected(platform);
    if (overwriting && !window.confirm(`Replace your saved ${platformLabel(platform)} connection with this new one?`)) return;
    await withBusy(async () => {
      await saveConnection({ platform, config: state.connectionDraft });
      state.connectionDraft = {}; state.connectionTested = false; state.editingConnection = false;
      toast(`${platformLabel(platform)} connection saved`);
      await loadConnections();
    }, "connectionBusy");
  } else if (action === "remove-connection") {
    const platform = target.dataset.platform;
    if (!window.confirm(`Remove your saved ${platformLabel(platform)} connection?`)) return;
    await withBusy(async () => {
      await deleteConnection(platform);
      toast(`${platformLabel(platform)} connection removed`);
      await loadConnections();
    }, "connectionBusy");
  } else if (action === "change-password") {
    const password = document.querySelector("#new-password")?.value || "";
    const confirm = document.querySelector("#confirm-password")?.value || "";
    if (password.length < 6) { toast("Password must be at least 6 characters."); return; }
    if (password !== confirm) { toast("Passwords don't match."); return; }
    if (!window.confirm("Update your account password now?")) return;
    await withBusy(async () => {
      await updatePassword(password);
      state.newPassword = ""; state.confirmPassword = "";
      toast("Password updated");
    }, "passwordBusy");
  } else if (action === "theme") {
    state.theme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("sls-theme", state.theme);
    render();
  } else if (action === "nav") {
    state.view = target.dataset.view;
    if (state.view === "wizard") state.step = 1;
    render();
    if (state.view === "dashboard") paintProjects();
    if (state.view === "chat" || state.view === "settings") loadApiKeys();
    if (state.view === "settings" || state.view === "wizard" || state.view === "integrations") loadConnections();
    if (state.view === "dictionary" || state.view === "integrations") loadProjectsCache();
  } else if (action === "new-project") {
    state.view = "wizard"; state.step = 1; state.generated = false; state.pipeline = -1;
    state.currentProjectId = null; state.documents = null;
    state.crossCheckResult = null;
    if (!state.connectionsLoaded) loadConnections();
    state.parsedModel = null; state.uploadedFileName = ""; state.pasteDraft = "";
    state.uploadedFileBlob = null; state.sourceFilePath = null; state.showSourceModel = false;
    state.suggestedKpis = []; state.connected = false; state.platformChecked = false;
    render();
  } else if (action === "open-project") {
    const id = target.dataset.id || target.closest("tr")?.dataset.id;
    const presetTab = target.dataset.tab;
    if (!id) return;
    await withBusy(async () => {
      const { project, docs } = await getProjectWithDocuments(id);
      state.currentProjectId = project.id;
      state.projectName = project.name;
      state.platform = project.platform || state.platform;
      state.objective = project.objective || state.objective;
      state.audience = project.audience || state.audience;
      state.scopeIn = project.scope_in || state.scopeIn;
      state.scopeOut = project.scope_out || state.scopeOut;
      state.documents = docs;
      state.suggestedKpis = [];
      state.sourceLabel = project.source_model || "the connected source";
      state.generatedDate = new Date(project.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
      state.parsedModel = project.model_snapshot || null;
      state.sourceFilePath = project.source_file_path || null;
      state.uploadedFileBlob = null;
      state.showSourceModel = false;
      state.generated = true; state.pipeline = 6;
      state.resultTab = presetTab || "brd"; state.view = "results";
    });
  } else if (action === "reuse-model") {
    if (!state.parsedModel) { toast("No source model available to reuse."); return; }
    state.view = "wizard"; state.step = 1; state.generated = false; state.pipeline = -1;
    state.currentProjectId = null; state.documents = null;
    state.uploadedFileBlob = null; state.showSourceModel = false;
    state.suggestedKpis = []; state.connected = true; state.platformChecked = false;
    state.expandedTables = new Set(state.parsedModel.tables[0] ? [state.parsedModel.tables[0].name] : []);
    toast("Model loaded — review it, then continue through the wizard.");
    render();
  } else if (action === "download-source-file") {
    if (!state.sourceFilePath) { toast("No original file was saved for this project."); return; }
    await withBusy(async () => {
      const url = await getModelFileUrl(state.sourceFilePath);
      window.open(url, "_blank");
    });
  } else if (action === "toggle-source-model") {
    state.showSourceModel = !state.showSourceModel; render();
  } else if (action === "source-tab") {
    state.sourceTab = target.dataset.tab; render();
  } else if (action === "test-connection") {
    await withBusy(async () => {
      const result = await testPbiConnection({ workspaceUrl: document.querySelector("#workspace-url")?.value });
      state.connected = result.ok; toast(result.message);
    });
  } else if (action === "demo-upload") {
    await withBusy(async () => {
      const result = await parseMetadata({ raw: SAMPLE_BIM_JSON, provider: state.agentProvider });
      state.parsedModel = result;
      state.uploadedFileName = "retail-sample.bim";
      state.uploadedFileBlob = null;
      state.connected = true;
      state.expandedTables = new Set(result.tables[0] ? [result.tables[0].name] : []);
      toast("Sample model parsed successfully");
    });
  } else if (action === "validate-metadata") {
    const raw = document.querySelector("#metadata-input")?.value.trim();
    if (!raw) { toast("Paste something to parse first."); return; }
    state.pasteDraft = raw;
    await withBusy(async () => {
      const result = await parseMetadata({ raw, provider: state.agentProvider });
      state.parsedModel = result;
      state.uploadedFileName = "pasted metadata";
      state.uploadedFileBlob = null;
      state.connected = true;
      state.expandedTables = new Set(result.tables[0] ? [result.tables[0].name] : []);
      toast("Metadata parsed successfully");
    });
  } else if (action === "toggle-table") {
    const table = target.dataset.table;
    state.expandedTables.has(table) ? state.expandedTables.delete(table) : state.expandedTables.add(table);
    render();
  } else if (action === "step") {
    if (target.dataset.step) { state.step = Number(target.dataset.step); render(); }
  } else if (action === "next") {
    readContext();
    await submitBusinessContext({ name: state.projectName, objective: state.objective });
    state.step = Math.min(4, state.step + 1); render();
  } else if (action === "prev") {
    state.step = Math.max(1, state.step - 1); render();
  } else if (action === "platform") {
    state.platform = target.dataset.platform; state.platformChecked = false; state.crossCheckResult = null; render();
  } else if (action === "test-platform") {
    if (!state.parsedModel) { toast("Parse a semantic model first."); return; }
    const slug = state.platform.toLowerCase();
    await withBusy(async () => {
      try {
        const result = await crossCheckPlatform({ modelContext: state.parsedModel, platform: slug });
        state.crossCheckResult = result;
        state.platformChecked = true;
        toast(`Live cross-check complete — ${result.mapped_pct}% mapped`);
      } catch (error) {
        state.platformChecked = false;
        toast(error.message || "Cross-check failed.");
      }
    });
  } else if (action === "send-context-chat") {
    const input = document.querySelector("#assistant-input");
    const text = input?.value.trim();
    if (!text) return;
    if (!state.agentProvider) { toast("Connect an AI provider in Settings to use the assistant."); return; }
    state.chat.push({ role: "user", text, time: "just now" });
    state.assistantDraft = "";
    render();
    await withBusy(async () => {
      try {
        const history = state.chat.map((m) => ({ role: m.role, content: m.text }));
        const result = await chatWithAgent({ message: text, history, modelContext: state.parsedModel, provider: state.agentProvider });
        state.chat.push({ role: "assistant", text: result.reply, time: "just now" });
      } catch (error) {
        state.chat.push({ role: "assistant", text: error.message || "I couldn't respond just now — try again.", time: "just now" });
      }
      render();
    }, "contextChatBusy");
  } else if (action === "generate") {
    if (!state.agentProvider) { toast("Connect an AI provider in Settings before generating."); return; }
    if (!state.parsedModel) { toast("Parse a semantic model first."); return; }
    readContext();
    state.busy = true; state.pipeline = 0; render();
    await delay(400);
    state.pipeline = 1; render();
    try {
      const businessContext = { projectName: state.projectName, objective: state.objective, audience: state.audience, scopeIn: state.scopeIn, scopeOut: state.scopeOut };
      const sourceLabel = `Power BI · ${state.sourceTab === "live" ? "live workspace" : state.uploadedFileName || "pasted metadata"}`;
      let sourceFilePath = state.sourceFilePath;
      if (state.uploadedFileBlob) {
        sourceFilePath = await uploadModelFile(state.uploadedFileBlob);
      }
      const generated = await generateDocuments({ modelContext: state.parsedModel, businessContext, platform: state.platform, provider: state.agentProvider });
      state.pipeline = 4; render();
      await delay(300);
      const project = await createProjectWithDocuments({ name: state.projectName, sourceModel: sourceLabel, platform: state.platform, docs: generated.docs, modelSnapshot: state.parsedModel, sourceFilePath, objective: state.objective, audience: state.audience, scopeIn: state.scopeIn, scopeOut: state.scopeOut });
      state.currentProjectId = project.id;
      state.sourceLabel = sourceLabel;
      state.sourceFilePath = sourceFilePath;
      state.generatedDate = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
      state.documents = generated.docs;
      state.suggestedKpis = generated.suggested_kpis || [];
      state.generated = true;
      toast("Documentation set generated");
    } catch (error) {
      toast(error.message || "Generation failed.");
    }
    state.pipeline = 5; state.busy = false; render();
  } else if (action === "view-results") {
    state.view = "results"; render();
  } else if (action === "result-tab") {
    state.resultTab = target.dataset.tab; render();
  } else if (action === "suggestion") {
    const input = document.querySelector("#document-chat-input");
    if (input) { input.value = target.dataset.text; input.focus(); }
  } else if (action === "send-document-chat") {
    const input = document.querySelector("#document-chat-input");
    const text = input?.value.trim();
    if (!text) return;
    if (!state.agentProvider) { toast("Connect an AI provider in Settings to ask questions."); return; }
    state.documentChat.push({ role: "user", text, time: "just now" }); render();
    await withBusy(async () => {
      try {
        const history = state.documentChat.map((m) => ({ role: m.role, content: m.text }));
        const modelContext = { model: state.parsedModel, active_document: state.documents?.[state.resultTab] };
        const result = await chatWithAgent({ message: text, history, modelContext, provider: state.agentProvider });
        state.documentChat.push({ role: "assistant", text: result.reply, time: "just now" });
      } catch (error) {
        state.documentChat.push({ role: "assistant", text: error.message || "I couldn't respond just now — try again.", time: "just now" });
      }
      render();
    }, "documentChatBusy");
  } else if (action === "share-project") {
    if (!state.currentProjectId) { toast("Save this project before sharing."); return; }
    await withBusy(async () => {
      try {
        const token = await enableShare(state.currentProjectId);
        const url = `${location.origin}${location.pathname}?share=${token}`;
        try {
          await navigator.clipboard.writeText(url);
          toast("Public share link copied to clipboard.");
        } catch {
          toast(`Share link: ${url}`);
        }
      } catch (error) {
        toast(error.message || "Could not create a share link.");
      }
    }, "shareBusy");
  } else if (action === "download-current") {
    await withBusy(() => downloadArtifact(state.resultTab), "downloadBusy");
  } else if (action === "download-all") {
    await withBusy(async () => {
      for (const tab of ["brd", "frd", "dictionary", "mapping"]) {
        await downloadArtifact(tab);
      }
    }, "downloadBusy");
  } else if (action === "toast") {
    toast(target.dataset.message || "This action is available in the full workspace.");
  }
}

async function downloadArtifact(tab) {
  if (!state.currentProjectId) { toast("Save this project before downloading."); return; }
  try {
    const { blob, filename } = await downloadDocumentFile(state.currentProjectId, tab);
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 500);
  } catch (error) {
    toast(error.message || `Could not download ${tab}.`);
  }
}

mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral" });

const sharedToken = new URLSearchParams(location.search).get("share");
if (sharedToken) state.view = "shared";

render();

(async () => {
  if (sharedToken) {
    await loadSharedProject(sharedToken);
    return;
  }
  try {
    const session = await getSession();
    if (session) applySession(session, session.user);
  } catch (error) {
    toast(error.message || "Could not verify session.");
  }
})();

onAuthStateChange((_event, session) => {
  if (sharedToken) return;
  if (session) {
    applySession(session, session.user);
  } else if (state.user) {
    state.user = null; state.view = "login"; render();
  }
});