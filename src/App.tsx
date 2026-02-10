import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import "./index.css";

export function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const sendMessage = async () => {
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
    <div className="container mx-auto p-8 text-center relative z-10">
      <div> 
        <div>
          {messages.map((message) => (
            <div>{message.role}: {message.content}</div>
          ))}
        </div>
        <Textarea 
          placeholder="Put your message to Claude here!"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          />
        <Button
          onClick={ sendMessage }>Send</Button>
      </div>
    </div>
  );
};

export default App;
