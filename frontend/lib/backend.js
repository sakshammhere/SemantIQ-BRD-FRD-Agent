// fastapi backend client, forwards the supabase token so the backend enforces the same rls
import { supabase } from "./auth.js";

// local dev default, update once the backend has a real deployed url
export const BACKEND_URL = "http://localhost:8000/api";

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("You must be signed in.");
  return { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` };
}

async function request(path, options = {}) {
  const headers = await authHeaders();
  const response = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const body = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const message = (isJson && body && body.detail) ? body.detail : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
}

export function chatWithAgent({ message, history, modelContext, provider, model }) {
  return request("/chat", {
    method: "POST",
    body: JSON.stringify({ message, history, model_context: modelContext || null, provider, model: model || null })
  });
}

export function agentStep({ messages, modelContext, provider, model, allowedTools }) {
  return request("/agent/step", {
    method: "POST",
    body: JSON.stringify({
      messages,
      model_context: modelContext || null,
      provider,
      model: model || null,
      allowed_tools: allowedTools || null
    })
  });
}

export function listApiKeys() {
  return request("/settings/api-keys");
}

export function testApiKey({ provider, apiKey }) {
  return request("/settings/api-keys/test", {
    method: "POST",
    body: JSON.stringify({ provider, api_key: apiKey })
  });
}

export function saveApiKey({ provider, apiKey, model }) {
  return request("/settings/api-keys", {
    method: "POST",
    body: JSON.stringify({ provider, api_key: apiKey, model: model || null })
  });
}

export function parseMetadata({ raw, provider, model }) {
  return request("/parse-metadata", {
    method: "POST",
    body: JSON.stringify({ raw, provider: provider || null, model: model || null })
  });
}

export function generateDocuments({ modelContext, businessContext, platform, provider, model }) {
  return request("/generate", {
    method: "POST",
    body: JSON.stringify({
      model_context: modelContext,
      business_context: businessContext,
      platform,
      provider,
      model: model || null
    })
  });
}

export function deleteApiKey(provider) {
  return request(`/settings/api-keys/${encodeURIComponent(provider)}`, { method: "DELETE" });
}

export function listConnections() {
  return request("/settings/connections");
}

export function testConnection({ platform, config }) {
  return request("/settings/connections/test", {
    method: "POST",
    body: JSON.stringify({ platform, config })
  });
}

export function saveConnection({ platform, label, config }) {
  return request("/settings/connections", {
    method: "POST",
    body: JSON.stringify({ platform, label: label || null, config })
  });
}

export function deleteConnection(platform) {
  return request(`/settings/connections/${encodeURIComponent(platform)}`, { method: "DELETE" });
}

export function crossCheckPlatform({ modelContext, platform }) {
  return request("/platform/cross-check", {
    method: "POST",
    body: JSON.stringify({ model_context: modelContext, platform })
  });
}

export async function downloadDocumentFile(projectId, docType) {
  const headers = await authHeaders();
  const response = await fetch(`${BACKEND_URL}/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(docType)}/file`, { headers });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body && body.detail) message = body.detail;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  return { blob, filename: match ? match[1] : `${docType}.bin` };
}
