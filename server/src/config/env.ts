import 'dotenv/config';
import { z } from 'zod';

/**
 * Schema de variables de entorno. Falla rápido al arrancar si algo falta.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((s) => s.split(',').map((o) => o.trim()).filter(Boolean)),

  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('plataforma'),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET debe tener al menos 32 caracteres')
    .refine(
      (val) => !val.includes('change-me'),
      'JWT_SECRET no puede ser el valor por defecto. Genera uno fuerte con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"',
    )
    .refine(
      (val) => !/^[a-zA-Z]+$/.test(val),
      'JWT_SECRET debe incluir números y/o caracteres especiales para mayor seguridad',
    ),
  JWT_EXPIRES_IN: z.string().default('8h'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Variables de entorno inválidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
