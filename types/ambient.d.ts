// Temporary module declaration for node-fetch in probe script context.
// If stricter typing needed: npm i -D @types/node-fetch (v2) or migrate to native fetch in Node 18.
declare module 'node-fetch' {
  const fetch: any;
  export default fetch;
}
