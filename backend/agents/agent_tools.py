# tool defs for the agent chat's loop. category drives frontend permission gating
# (read = auto-run, write = gated, destructive = always confirmed). backend never
# executes a tool itself, frontend does that w/ its existing supabase access
from __future__ import annotations

TOOLS = [
    {
        "name": "list_projects",
        "description": "List the user's saved documentation projects (name, platform, status, last updated). Use this before referencing a project by name.",
        "parameters": {"type": "object", "properties": {}, "required": []},
        "category": "read",
    },
    {
        "name": "get_project",
        "description": "Get full details of one project: its business context, platform, source model summary, and which documents exist.",
        "parameters": {
            "type": "object",
            "properties": {"project_id": {"type": "string", "description": "The project's id, from list_projects."}},
            "required": ["project_id"],
        },
        "category": "read",
    },
    {
        "name": "get_document",
        "description": "Read the full generated content of one document (BRD, FRD, semantic dictionary, or integration mapping) for a project.",
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "doc_type": {"type": "string", "enum": ["brd", "frd", "dictionary", "mapping"]},
            },
            "required": ["project_id", "doc_type"],
        },
        "category": "read",
    },
    {
        "name": "get_workspace_status",
        "description": "Check which AI providers and platform connections (Snowflake/Databricks/AWS) are currently connected for this user. Never reveals secret values.",
        "parameters": {"type": "object", "properties": {}, "required": []},
        "category": "read",
    },
    {
        "name": "get_model_diagram",
        "description": "Render a real, accurate diagram of the tables and relationships in a semantic model — either the model currently attached to this conversation (omit project_id) or a saved project's model (pass project_id). Use this whenever the user asks to see, visualize, or understand how tables relate to each other, instead of describing the relationships in a Mermaid code block yourself — this tool draws from the real parsed model data, guaranteed accurate.",
        "parameters": {
            "type": "object",
            "properties": {"project_id": {"type": ["string", "null"], "description": "Optional — a saved project's id. Omit or pass null to use the model currently attached to this conversation."}},
            "required": [],
        },
        "category": "read",
    },
    {
        "name": "generate_documentation",
        "description": "Generate a brand-new documentation project (BRD, FRD, dictionary, mapping) from the semantic model currently attached to this conversation, plus business context. Requires a model to already be attached (uploaded/pasted/pulled in this chat) — if none is attached, ask the user to attach one first instead of calling this.",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Project name."},
                "objective": {"type": "string", "description": "The business objective this documentation serves."},
                "audience": {"type": "string", "description": "Who this is for, e.g. 'Finance, BI Architecture'."},
                "scope_in": {"type": "string", "description": "What's explicitly in scope."},
                "scope_out": {"type": "string", "description": "What's explicitly out of scope."},
                "platform": {"type": "string", "enum": ["Snowflake", "Databricks", "AWS"]},
            },
            "required": ["name", "objective", "audience", "scope_in", "scope_out", "platform"],
        },
        "category": "write",
    },
    {
        "name": "edit_project_context",
        "description": "Update an existing project's name, business context, or target platform. Only pass the fields that are actually changing — omit or pass null for anything unchanged. Does not regenerate documents by itself — call regenerate_documents afterward if the documents should reflect the change.",
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "name": {"type": ["string", "null"]},
                "objective": {"type": ["string", "null"]},
                "audience": {"type": ["string", "null"]},
                "scope_in": {"type": ["string", "null"]},
                "scope_out": {"type": ["string", "null"]},
                "platform": {"type": ["string", "null"], "enum": ["Snowflake", "Databricks", "AWS", None]},
            },
            "required": ["project_id"],
        },
        "category": "write",
    },
    {
        "name": "regenerate_documents",
        "description": "Re-run document generation for an existing project using its saved model and current business context, overwriting its documents with a fresh set.",
        "parameters": {"type": "object", "properties": {"project_id": {"type": "string"}}, "required": ["project_id"]},
        "category": "write",
    },
    {
        "name": "create_share_link",
        "description": "Create (or retrieve the existing) public read-only share link for a project's documents.",
        "parameters": {"type": "object", "properties": {"project_id": {"type": "string"}}, "required": ["project_id"]},
        "category": "write",
    },
    {
        "name": "download_document",
        "description": "Trigger a real file download (.docx or .xlsx) of one of a project's documents in the user's browser.",
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "doc_type": {"type": "string", "enum": ["brd", "frd", "dictionary", "mapping"]},
            },
            "required": ["project_id", "doc_type"],
        },
        "category": "write",
    },
    {
        "name": "navigate",
        "description": "Take the user to a different screen in the app.",
        "parameters": {
            "type": "object",
            "properties": {"view": {"type": "string", "enum": ["dashboard", "wizard", "chat", "settings"]}},
            "required": ["view"],
        },
        "category": "write",
    },
    {
        "name": "delete_project",
        "description": "Permanently delete a project and all its documents. This cannot be undone.",
        "parameters": {"type": "object", "properties": {"project_id": {"type": "string"}}, "required": ["project_id"]},
        "category": "destructive",
    },
    {
        "name": "sign_out",
        "description": "Sign the user out of SemantIQ.",
        "parameters": {"type": "object", "properties": {}, "required": []},
        "category": "destructive",
    },
]

TOOLS_FOR_LLM = [{"name": t["name"], "description": t["description"], "parameters": t["parameters"]} for t in TOOLS]

SYSTEM_PROMPT = """You are the SemantIQ AI agent — a real agentic coworker inside a Power BI \
semantic layer documentation platform, not just a Q&A chatbot. You can both explain things AND \
take real actions using the tools available to you.

What SemantIQ does: turns Power BI semantic models into governed documentation — Business \
Requirements Documents, Functional Requirements Documents, a semantic data dictionary, and an \
integration mapping report comparing the model against Snowflake/Databricks/AWS — plus suggests \
additional KPIs.

How to work:
- Use tools whenever a request calls for real information or a real action — don't guess at facts \
you can look up (project details, document content, connection status).
- Before generating a new project or editing/regenerating an existing one, make sure you understand \
what the user actually wants; ask a clarifying question if the request is ambiguous rather than \
guessing at business context.
- Explain what you're about to do in plain language before or alongside calling a write or \
destructive tool — the user will see an approve/deny prompt for anything that isn't a pure read, so \
make your intent clear in your accompanying text.
- Never ask the user to paste an API key, password, or any other secret into this chat, and never \
accept one if offered — all credentials are entered only through Settings, which encrypts them. If \
asked to connect a new AI provider or platform, tell the user to add it in Settings and offer to \
navigate them there.
- Never invent table, column, or measure names that aren't in the semantic model actually attached \
to this conversation.
- Be conversational, concise, and proactive — offer relevant next steps and KPI suggestions where \
genuinely useful, the way a sharp analyst colleague would.

Formatting:
- The chat renders Markdown: use headers, bold, bullet/numbered lists, and tables freely — they \
display as real formatted elements, not raw text, so prefer a table over a wall of prose when \
comparing several things.
- For the model's actual table relationships specifically, call get_model_diagram instead of trying \
to draw it yourself — it renders from the real data, guaranteed accurate.
- For any OTHER diagram-worthy explanation (architecture, a pipeline/process flow, a sequence of \
steps), include a compact Mermaid diagram in a ```mermaid fenced code block alongside your prose — \
use flowchart/graph syntax for architecture or process flows, sequenceDiagram for step-by-step \
interactions. Keep it short: a diagram should clarify structure, not restate every sentence you \
already wrote."""
