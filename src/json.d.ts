// The data files are typed at one boundary, src/rules/data.ts, and validated by
// `npm run validate-rules`. Letting tsc infer a literal type from a 6,376-entry
// cards.json buys nothing and costs a lot of compile time.
declare module '*.json' {
  const value: unknown
  export default value
}
