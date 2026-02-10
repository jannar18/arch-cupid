import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpIcon } from "lucide-react"
import { useState } from "react";
import "./index.css";

export function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const sendMessage = async () => {
    if (!input) return;
    const response = await fetch( "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({message: input}),
    });
    const data = await response.json();
    
    setMessages([...messages,
      {role: "user", content: input},
      {role: "assistant", content: data.response},
    ]);

    setInput("");
  };

  return (
    <div className="flex flex-col items-center mx-auto p-4 h-screen">
      <div className="flex flex-col items-center gap-4"> 
        <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4"> 
          <div>
          {messages.map((message) => (
            <div>{message.role}: {message.content}</div>
          ))}
        </div>
        </ScrollArea>
        <Textarea
          className="min-h-[80px] w-[350px] rounded-md border p-4 resize-none overflow-hidden"
          placeholder="Put your message to Claude here!"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            event.target.style.height = "auto";
            event.target.style.height = event.target.scrollHeight + "px";
          }}
          />
        <Button
        variant="outline" size="icon" className="rounded-full"
        onClick={ sendMessage }><ArrowUpIcon /></Button>
      </div>
    </div>
  );
};

export default App;
