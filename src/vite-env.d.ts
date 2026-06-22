/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL del backend REST. Ej: http://localhost:3001/api/v1 */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
