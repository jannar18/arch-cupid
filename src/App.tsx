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
    <div className="flex flex-col items-center mx-auto px-4 py-4 h-screen w-full overflow-hidden">
    <div className="flex items-center gap-4 w-full justify-end">
      <a href="/wall"  className="text-pink-400 font-medium hover:text-[#E34234]">
        Wall of Love
      </a>
      <button
        className="text-gray-400 hover:text-[#E34234]"
        onClick={async () => {
          await authClient.signOut()
          navigate("/")
        }}>Sign Out</button>
    </div>
    <SideBar conversations={conversations} refreshConversations={refreshConversations}/>
    <ChatView refreshConversations={refreshConversations}/>
    </div>
  );
};

export default App;
