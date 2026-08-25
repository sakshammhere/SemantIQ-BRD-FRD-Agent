/**
 * Shared data contracts for the mock API. Replace these JSDoc contracts with
 * TypeScript interfaces when the real Node API is connected.
 *
 * @typedef {{name: string, type: string, description: string, key?: boolean}} Column
 * @typedef {{name: string, rowCount: string, description: string, columns: Column[]}} Table
 * @typedef {{name: string, expression: string, format: string, description: string}} Measure
 * @typedef {{name: string, from: string, to: string, cardinality: string}} Relationship
 * @typedef {{name: string, sourceModel: string, status: string, updated: string}} Project
 * @typedef {{table: string, column: string, targetTable: string, targetColumn: string, status: "Matched"|"Renamed"|"Missing", note: string}} PlatformMapping
 * @typedef {{role: "user"|"assistant", text: string, time: string}} ChatMessage
 * @typedef {{brd: string, frd: string, dictionary: string, mapping: string}} GeneratedDocSet
 */

export const APP_VERSION = "1.0.0";