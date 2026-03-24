import { useState } from "react";
import { useNavigate } from "react-router";
import {signIn} from "../lib/sign-in";
import {signUp} from "../lib/sign-up";
import { authClient } from "../lib/auth-client";

type Mode = "signin" | "signup" | "forgot";

export function LoginPage() {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [mode, setMode] = useState<Mode>("signin")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [forgotSent, setForgotSent] = useState(false)
    const navigate = useNavigate();

    async function handleSubmit() {
        setError("");
        setLoading(true);

        try {
            if (mode === "forgot") {
                if (!email) {
                    setError("Please enter your email");
                    return;
                }
                const { error } = await authClient.forgetPassword({
                    email,
                    redirectTo: "/",
                });
                if (error) {
                    setError(error.message || "Failed to send reset email");
                    return;
                }
                setForgotSent(true);
                return;
            }

            if (!email || !password) {
                setError("Please fill in all fields");
                return;
            }

            if (mode === "signup") {
                if (password.length < 8) {
                    setError("Password must be at least 8 characters");
                    return;
                }
                if (!name) {
                    setError("Please enter your name");
                    return;
                }
                const { error } = await signUp(email, password, name);
                if (error) {
                    setError(error.message || "Sign up failed");
                    return;
                }
            } else {
                const { error } = await signIn(email, password);
                if (error) {
                    setError(error.message || "Invalid email or password");
                    return;
                }
            }

            navigate("/new");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col gap-4 w-full max-w-[600px] px-4">
                <h2 className="text-lg font-medium text-[#E34234]">Find Your Architecture Valentine</h2>

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}

                {mode === "forgot" && forgotSent ? (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-gray-600">
                            If an account exists for that email, a reset link has been sent. Check your inbox.
                        </p>
                        <p
                            className="text-sm text-gray-500 cursor-pointer hover:text-[#E34234]"
                            onClick={() => { setMode("signin"); setForgotSent(false); setError(""); }}
                        >
                            Back to sign in
                        </p>
                    </div>
                ) : (
                    <>
                        <input
                            className="w-full border border-gray-300 border-t-0 p-0 rounded-none focus:outline-none focus:bg-[#FDF3F2] placeholder:text-gray-400"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {mode !== "forgot" && (
                            <input
                                className="w-full border border-gray-300 border-t-0 p-0 rounded-none focus:outline-none focus:bg-[#FDF3F2] placeholder:text-gray-400"
                                placeholder="Password (min 8 characters)"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        )}

                        {mode === "signup" && (
                            <input
                                className="w-full border border-gray-300 border-t-0 p-0 rounded-none focus:outline-none focus:bg-[#FDF3F2] placeholder:text-gray-400"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        )}

                        <button
                            className="text-[#E34234] font-medium cursor-pointer hover:opacity-70 text-left disabled:opacity-50"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "..." :
                                mode === "forgot" ? "Send Reset Link" :
                                mode === "signup" ? "Sign Up" : "Sign In"}
                        </button>

                        <button
                            className="text-gray-500 font-medium cursor-pointer hover:text-[#E34234] text-left"
                            onClick={async () => {
                                setError("");
                                await authClient.signIn.social({
                                    provider: "github",
                                    callbackURL: "/new",
                                })
                            }}
                        >
                            Sign in with GitHub
                        </button>

                        <div className="flex flex-col gap-1">
                            {mode !== "forgot" && (
                                <p
                                    className="text-sm text-gray-500 cursor-pointer hover:text-[#E34234]"
                                    onClick={() => { setMode("forgot"); setError(""); }}
                                >
                                    Forgot password?
                                </p>
                            )}
                            <p
                                className="text-sm text-gray-500 cursor-pointer hover:text-[#E34234]"
                                onClick={() => {
                                    setMode(mode === "signup" ? "signin" : mode === "signin" ? "signup" : "signin");
                                    setError("");
                                }}
                            >
                                {mode === "signup" ? "Already have an account? Sign in" :
                                 mode === "forgot" ? "Back to sign in" :
                                 "Don't have an account? Sign up"}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

