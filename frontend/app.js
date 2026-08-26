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

