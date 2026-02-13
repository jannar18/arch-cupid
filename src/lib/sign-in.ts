import { authClient } from "./auth-client"; 

export async function signIn(email:string, password:string) {
    const { data, error } = await authClient.signIn.email({
            /**
             * The user email
             */
            email,
            /**
             * The user password
             */
            password,
            /**
             * A URL to redirect to after the user verifies their email (optional)
             */
            callbackURL: "/new",
            /**
             * remember the user session after the browser is closed. 
             * @default true
             */
            rememberMe: false,
    }, {
        //callbacks
    });
    return {data, error}
}
