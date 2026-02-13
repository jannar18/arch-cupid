import { useState, useEffect } from "react";
import type { Conversation } from "./storage";
import { ChatView } from "./components/ChatView";
import { SideBar } from "./components/SideBar";
import "./index.css";

export function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const refreshConversations = async () => {
    const res = await fetch("/api/conversations");
    setConversations(await res.json());
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  return (
    <div className="flex flex-col items-center mx-auto p-4 h-screen overflow-hidden">
    <SideBar conversations={conversations} refreshConversations={refreshConversations}/>
    <ChatView refreshConversations={refreshConversations}/>
    </div>
  );
};

export default App;
