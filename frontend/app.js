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

