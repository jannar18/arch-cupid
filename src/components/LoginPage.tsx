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
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col gap-4 w-[600px] max-w-2xl">
                    <h2 className="text-lg font-medium text-[#E34234]">"Login"</h2>
                <input
                    className="w-full border border-gray-300 border-t-0 p-0 rounded-none focus:outline-none focus:bg-[#FDF3F2] placeholder:text-gray-400"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <input
                    className="w-full border border-gray-300 border-t-0 p-0 rounded-none focus:outline-none focus:bg-[#FDF3F2] placeholder:text-gray-400"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                {isSignUp && (
                    <input
                        className="w-full border border-gray-300 border-t-0 p-0 rounded-none focus:outline-none focus:bg-[#FDF3F2] placeholder:text-gray-400"
                        placeholder="Name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                )}

                <button
                    className="text-[#E34234] font-medium cursor-pointer hover:opacity-70 text-left"
                    onClick={async () => {
                        if (isSignUp) {
                            await signUp(email, password, name)
                        } else {
                            await signIn(email, password)
                        }
                        navigate("/new"),
                        setEmail(""),
                        setPassword(""),
                        setName("");
                    }}
                >
                    {isSignUp ? "Sign Up" : "Sign In"}
                </button>

                <button
                    className="text-gray-500 font-medium cursor-pointer hover:text-[#E34234] text-left"
                    onClick={async () => {
                        await authClient.signIn.social({ provider: "github" })
                    }}
                >
                    Sign in with GitHub
                </button>

                <p
                    className="text-sm text-gray-500 cursor-pointer hover:text-[#E34234]"
                    onClick={() => setIsSignUp(!isSignUp)}
                >
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </p>
            </div>
        </div>
        
    )
}

