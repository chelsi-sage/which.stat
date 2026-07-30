// Lets us import Python source files as raw strings (Vite ?raw) to hand to Pyodide.
declare module '*.py?raw' {
  const content: string
  export default content
}
