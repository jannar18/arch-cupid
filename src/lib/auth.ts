import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
    database: new Pool({ connectionString: process.env.DATABASE_URL }),

    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        sendResetPassword: async ({ user, url }) => {
            // TODO: Replace with a real email provider (Resend, SendGrid, etc.)
            console.log(`[Auth] Password reset for ${user.email}: ${url}`);
        },
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
});