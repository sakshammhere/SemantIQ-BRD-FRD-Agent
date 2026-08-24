"""Renders the structured JSON produced by the doc agents into real Office files.

BRD/FRD are narrative requirement documents -> real .docx (python-docx).
Data Dictionary/Integration Mapping are inherently tabular -> real .xlsx (openpyxl).

Deterministic, template-driven — no LLM call happens here. This is purely a
formatting layer over content the agents already produced.
"""
from __future__ import annotations

import io
from typing import Any, Dict, List

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor, Inches
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.worksheet import Worksheet

# ---- Brand palette (matches the frontend's design tokens) ----
INK = RGBColor(0x16, 0x22, 0x23)
MUTED = RGBColor(0x70, 0x80, 0x80)
TEAL = RGBColor(0x0E, 0x6B, 0x63)
AMBER = RGBColor(0xA6, 0x72, 0x0C)
VIOLET = RGBColor(0x5B, 0x4A, 0x96)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

TEAL_HEX = "0E6B63"
TEAL_SOFT_HEX = "E7F4F1"
AMBER_HEX = "A6720C"
AMBER_SOFT_HEX = "FFF4D9"
VIOLET_HEX = "5B4A96"
RED_HEX = "B4232B"
RED_SOFT_HEX = "FCE8E8"
LINE_HEX = "DCE5E4"
INK_HEX = "162223"


# =====================================================================  DOCX

def _cell_shade(cell, hex_color: str) -> None:
    tcPr = cell._tc.get_or_add_tcPr()
    shd = tcPr.makeelement(qn("w:shd"), {qn("w:val"): "clear", qn("w:color"): "auto", qn("w:fill"): hex_color})
    tcPr.append(shd)


def _set_cell_text(cell, text: str, bold=False, color=None, size=10) -> None:
    cell.text = ""
    p = cell.paragraphs[0]
    r = p.add_run(str(text))
    r.font.size = Pt(size)
    r.font.bold = bold
    if color:
        r.font.color.rgb = color


def _new_doc() -> Document:
    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(10.5)
    style.font.color.rgb = INK
    for section in doc.sections:
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
    return doc


def _cover(doc: Document, kicker: str, title: str, meta: Dict[str, Any]) -> None:
    p = doc.add_paragraph()
    r = p.add_run("SemantIQ")
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = TEAL

    p = doc.add_paragraph()
    r = p.add_run(kicker)
    r.font.size = Pt(10)
    r.font.bold = True
    r.font.color.rgb = AMBER
    p.space_before = Pt(14)

    p = doc.add_paragraph()
    r = p.add_run(title)
    r.font.size = Pt(26)
    r.font.bold = True
    r.font.color.rgb = INK
    p.space_before = Pt(4)
    p.space_after = Pt(10)

    p = doc.add_paragraph()
    r = p.add_run(
        f"Prepared from {meta.get('source_label', 'the connected source model')} and business "
        f"context captured on {meta.get('generated_date', '')}."
    )
    r.font.size = Pt(10.5)
    r.font.italic = True
    r.font.color.rgb = MUTED
    p.space_after = Pt(4)

    table = doc.add_table(rows=2, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    labels = ["Version", "Status", "Prepared for", "Platform"]
    values = ["1.0", "Draft — for review", meta.get("audience", "Stakeholders"), meta.get("platform", "—")]
    for i, (lab, val) in enumerate(zip(labels, values)):
        _set_cell_text(table.cell(0, i), lab, bold=True, color=MUTED, size=9)
        _set_cell_text(table.cell(1, i), val, size=10)
        _cell_shade(table.cell(0, i), TEAL_SOFT_HEX)
    doc.add_paragraph().space_after = Pt(6)


def _heading(doc: Document, text: str, level=1, color=TEAL) -> None:
    p = doc.add_heading(level=level)
    r = p.add_run(text)
    r.font.color.rgb = color
    r.font.name = "Calibri"
    if level == 1:
        r.font.size = Pt(16)
        p.space_before = Pt(18)
        p.space_after = Pt(6)
    else:
        r.font.size = Pt(13)
        p.space_before = Pt(12)
        p.space_after = Pt(4)


def _para(doc: Document, text: str, italic=False, color=INK, size=10.5) -> None:
    if not text:
        return
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.font.size = Pt(size)
    r.font.italic = italic
    r.font.color.rgb = color
    p.space_after = Pt(6)


def _bullets(doc: Document, items: List[str]) -> None:
    for item in items or []:
        p = doc.add_paragraph(style="List Bullet")
        r = p.add_run(str(item))
        r.font.size = Pt(10.5)
        r.font.color.rgb = INK


def _table(doc: Document, headers: List[str], rows: List[List[str]], widths=None, header_color=TEAL_HEX) -> None:
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    for i, h in enumerate(headers):
        _set_cell_text(table.cell(0, i), h, bold=True, color=WHITE, size=9.5)
        _cell_shade(table.cell(0, i), header_color)
    for row in rows:
        cells = table.add_row().cells
        for i, val in enumerate(row):
            _set_cell_text(cells[i], val, size=9.5)
    if widths:
        for i, w in enumerate(widths):
            for row in table.rows:
                row.cells[i].width = Inches(w)
    doc.add_paragraph().space_after = Pt(4)


def _priority_label(p: str) -> str:
    return {"Must": "MUST HAVE", "Should": "SHOULD HAVE", "Could": "COULD HAVE"}.get(p, p or "—")


