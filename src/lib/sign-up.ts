import { authClient } from "./auth-client"; 

export async function signUp(email: string, password: string, name: string){
    const { data, error } = await authClient.signUp.email({
        email, 
        password, 
        name,
        callbackURL: "/new" // can lead user to dashboard or just the main chat page
    }, {
        onRequest: (ctx) => {
            //show loading
        },
        onSuccess: (ctx) => {
            //redirect to the dashboard or sign in page 
        },
        onError: (ctx) => {
            // display the error message
            alert(ctx.error.message);
        },
    });
    return { data, error }
}
