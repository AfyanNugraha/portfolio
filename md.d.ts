// Allow importing .md files as raw strings (see turbopack rule in next.config.ts)
declare module "*.md" {
  const content: string;
  export default content;
}
