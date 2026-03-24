import { authClient } from "./auth-client";

export async function signUp(email: string, password: string, name: string){
    const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/new",
    });
    return { data, error }
}
