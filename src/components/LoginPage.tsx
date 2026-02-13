import { useState } from "react";
import { useNavigate } from "react-router";
import {signIn} from "../lib/sign-in";
import {signUp} from "../lib/sign-up";
import { authClient } from "../lib/auth-client";


export function LoginPage() {
    const [ email, setEmail ] = useState("")
    const [ name, setName ] = useState("")
    const [password, setPassword ] = useState("")
    const [ isSignUp, setIsSignUp ] = useState(false)
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center h-screen">

            <h2>Login</h2>
            <input placeholder="Email" value={email} onChange={(event) => 
                setEmail(event.target.value)}/>
            <input placeholder="Password" value={password} onChange={(event) => 
                setPassword(event.target.value)}/>
            {isSignUp && <input placeholder="Name" value={name} onChange={(event) => 
            setName(event.target.value)}/>}

            <button
                onClick={async () => {
                    if (isSignUp) {
                        await signUp(email, password, name)
                    } else {
                        await signIn(email,password)
                    }
                    navigate("/new"),
                    setEmail(""), 
                    setPassword(""),
                    setName("");
                }}>{isSignUp ? "Sign Up" : "Sign In" }
            </button>
            <button  
                onClick={async () => { 
                    await authClient.signIn.social({ provider: "github"})
                }}>Sign in with GitHub</button>
            <p onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign-up"}
            </p>

        </div>
        
    )
}

