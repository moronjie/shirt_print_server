import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import mongoose from 'mongoose';
import config from '../config';
import { comparePassword, hashPassword } from './bcrypt';
import { openAPI } from 'better-auth/plugins';
import { jwt } from 'better-auth/plugins';
import type { BetterAuthOptions } from 'better-auth';

export const createAuth = () => {
  return betterAuth({
    baseURL: config.BETTER_AUTH_URL,
    secret: config.BETTER_AUTH_SECRET!,
    trustedOrigins: [config.FRONTEND_URL!],
    database: mongodbAdapter(mongoose.connection.db!, {
      client: mongoose.connection.getClient(),
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      password: {
        hash: hashPassword,
        verify: comparePassword,
      },
    },
    socialProviders: {
      google: {
        clientId: config.GOOGLE_CLIENT_ID!,
        clientSecret: config.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${config.BETTER_AUTH_URL}/api/auth/callback/google`,
      },
    },
    plugins: [openAPI(), jwt()],
    advanced: {
      database: {
        generateId: false,
      },
      cookiePrefix: 'tshirtprint',
      cookies: {
        session_token: {
          name: 'tshirtprint_session_token',
          attributes: {},
        },
      },
    },
  });
};
