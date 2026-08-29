// api boundary. project/doc persistence is real supabase, pbi live-connect below is still mocked
import { supabase } from "./auth.js";

const wait = (ms = 520) => new Promise((resolve) => setTimeout(resolve, ms));

const model = {
  name: "Retail Analytics Semantic Model",
  source: "Power BI · retail-prod-workspace",
  tables: [
    {
      name: "FactSales",
      rowCount: "2.4M rows",
      description: "One row per invoice line, refreshed nightly from the order system.",
      columns: [
        { name: "SalesID", type: "Whole number", description: "Unique invoice line identifier", key: true },
        { name: "OrderDate", type: "Date", description: "Date the order was placed" },
        { name: "CustomerID", type: "Whole number", description: "Customer foreign key" },
        { name: "ProductID", type: "Whole number", description: "Product foreign key" },
        { name: "Amount", type: "Decimal number", description: "Net line amount in USD" },
        { name: "Margin", type: "Decimal number", description: "Gross margin in USD" }
      ]
    },
    {
      name: "DimCustomer",
      rowCount: "84.2K rows",
      description: "Customer master with segment and geography attributes.",
      columns: [
        { name: "CustomerID", type: "Whole number", description: "Unique customer identifier", key: true },
        { name: "CustomerName", type: "Text", description: "Display name" },
        { name: "Segment", type: "Text", description: "Enterprise, Mid-market, or SMB" },
        { name: "Region", type: "Text", description: "Commercial operating region" },
        { name: "SignupDate", type: "Date", description: "Date the customer account opened" }
      ]
    },
    {
      name: "DimProduct",
      rowCount: "12.8K rows",
      description: "Product catalog hierarchy and pricing attributes.",
      columns: [
        { name: "ProductID", type: "Whole number", description: "Unique product identifier", key: true },
        { name: "ProductName", type: "Text", description: "Customer-facing product name" },
        { name: "Category", type: "Text", description: "Merchandising category" },
        { name: "UnitPrice", type: "Decimal number", description: "Current list price" }
      ]
    }
  ],
  relationships: [
    { name: "Customer sales", from: "FactSales.CustomerID", to: "DimCustomer.CustomerID", cardinality: "Many-to-one" },
    { name: "Product sales", from: "FactSales.ProductID", to: "DimProduct.ProductID", cardinality: "Many-to-one" }
  ],
  measures: [
    { name: "Total Revenue", expression: "SUM(FactSales[Amount])", format: "$#,##0", description: "Net revenue after discounts and returns" },
    { name: "Gross Margin", expression: "SUM(FactSales[Margin])", format: "$#,##0", description: "Revenue less product cost" },
    { name: "Margin %", expression: "DIVIDE([Gross Margin], [Total Revenue])", format: "0.0%", description: "Gross margin as a share of revenue" },
    { name: "Active Customers", expression: "DISTINCTCOUNT(DimCustomer[CustomerID])", format: "#,##0", description: "Customers with at least one order in the period" }
  ]
};

export async function listProjects() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProjectWithDocuments({ name, sourceModel, platform, docs, modelSnapshot, sourceFilePath, objective, audience, scopeIn, scopeOut }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to generate documentation.");

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      source_model: sourceModel,
      platform,
      status: "Ready",
      model_snapshot: modelSnapshot || null,
      source_file_path: sourceFilePath || null,
      objective: objective || null,
      audience: audience || null,
      scope_in: scopeIn || null,
      scope_out: scopeOut || null
    })
    .select()
    .single();
  if (projectError) throw projectError;

  const rows = Object.entries(docs).map(([docType, content]) => ({
    project_id: project.id,
    user_id: user.id,
    doc_type: docType,
    content: JSON.stringify(content)
  }));
  const { error: docsError } = await supabase.from("documents").insert(rows);
  if (docsError) throw docsError;

  return project;
}

export async function updateProject(projectId, { name, objective, audience, scopeIn, scopeOut, platform }) {
  // loose null check on purpose, an agent tool call may send explicit null for "unchanged"
  const patch = {};
  if (name != null) patch.name = name;
  if (objective != null) patch.objective = objective;
  if (audience != null) patch.audience = audience;
  if (scopeIn != null) patch.scope_in = scopeIn;
  if (scopeOut != null) patch.scope_out = scopeOut;
  if (platform != null) patch.platform = platform;

  const { data, error } = await supabase.from("projects").update(patch).eq("id", projectId).select().single();
  if (error) throw error;
  return data;
}

export async function replaceProjectDocuments(projectId, docs) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const { error: deleteError } = await supabase.from("documents").delete().eq("project_id", projectId);
  if (deleteError) throw deleteError;

  const rows = Object.entries(docs).map(([docType, content]) => ({
    project_id: projectId,
    user_id: user.id,
    doc_type: docType,
    content: JSON.stringify(content)
  }));
  const { error: insertError } = await supabase.from("documents").insert(rows);
  if (insertError) throw insertError;
}

export async function deleteProject(projectId) {
  const { error: docsError } = await supabase.from("documents").delete().eq("project_id", projectId);
  if (docsError) throw docsError;
  const { error: projectError } = await supabase.from("projects").delete().eq("id", projectId);
  if (projectError) throw projectError;
}

export async function listConversations() {
  const { data, error } = await supabase
    .from("agent_conversations")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getConversation(id) {
  const { data, error } = await supabase.from("agent_conversations").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createConversation({ title, messages, history, modelContext, modelLabel }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const { data, error } = await supabase
    .from("agent_conversations")
    .insert({
      user_id: user.id,
      title,
      messages,
      history,
      model_context: modelContext || null,
      model_label: modelLabel || null
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateConversation(id, { title, messages, history, modelContext, modelLabel }) {
  const patch = {};
  if (title !== undefined) patch.title = title;
  if (messages !== undefined) patch.messages = messages;
  if (history !== undefined) patch.history = history;
  if (modelContext !== undefined) patch.model_context = modelContext;
  if (modelLabel !== undefined) patch.model_label = modelLabel;
  const { data, error } = await supabase.from("agent_conversations").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteConversation(id) {
  const { error } = await supabase.from("agent_conversations").delete().eq("id", id);
  if (error) throw error;
}

export async function getProjectWithDocuments(projectId) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (projectError) throw projectError;

  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("doc_type, content")
    .eq("project_id", projectId);
  if (docsError) throw docsError;

  const docs = {};
  documents.forEach((row) => { docs[row.doc_type] = JSON.parse(row.content); });
  return { project, docs };
}

export async function enableShare(projectId) {
  const { data: existing, error: fetchError } = await supabase
    .from("projects")
    .select("share_token")
    .eq("id", projectId)
    .single();
  if (fetchError) throw fetchError;
  if (existing.share_token) return existing.share_token;

  const token = crypto.randomUUID();
  const { error: updateError } = await supabase.from("projects").update({ share_token: token }).eq("id", projectId);
  if (updateError) throw updateError;
  return token;
}

export async function getSharedProject(token) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("share_token", token)
    .maybeSingle();
  if (projectError) throw projectError;
  if (!project) return null;

  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("doc_type, content")
    .eq("project_id", project.id);
  if (docsError) throw docsError;

  const docs = {};
  documents.forEach((row) => { docs[row.doc_type] = JSON.parse(row.content); });
  return { project, docs };
}

export async function uploadModelFile(file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to upload a file.");
  const path = `${user.id}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from("model-files").upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export async function getModelFileUrl(path) {
  const { data, error } = await supabase.storage.from("model-files").createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function testPbiConnection({ workspaceUrl = "" } = {}) {
  await wait(720);
  return { ok: true, message: "Connection verified", workspace: workspaceUrl || "retail-prod-workspace", model };
}

export async function submitBusinessContext(context) {
  await wait(360);
  return { ok: true, context };
}

export { model };