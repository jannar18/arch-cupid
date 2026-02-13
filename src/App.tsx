import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Conversation } from "./storage";
import { ChatView } from "./components/ChatView";
import { SideBar } from "./components/SideBar";
import { authClient } from "./lib/auth-client"; 

import "./index.css";

export function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const navigate = useNavigate();

  const { data: session, isPending } = authClient.useSession()

  const refreshConversations = async () => {
    const res = await fetch("/api/conversations");
    setConversations(await res.json());
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  if (isPending) return <div>Loading...</div>
    if (!session) {
        navigate("/")
        return null
    }
    
  return (
    <div className="flex flex-col items-center mx-auto p-4 h-screen overflow-hidden">
    <button 
    onClick={async () => {
      await authClient.signOut()
      navigate("/")
    }}>Sign Out</button>
    <SideBar conversations={conversations} refreshConversations={refreshConversations}/>
    <ChatView refreshConversations={refreshConversations}/>
    </div>
  );
};

export default App;
