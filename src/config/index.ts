import dotenv from 'dotenv';
dotenv.config();

type Config = {
  PORT?: string;
  MONGO_URI?: string;
  DB_NAME?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  FRONTEND_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

const config: Config = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGODB_URL!,
  DB_NAME: process.env.DB_NAME!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
};

export default config;
