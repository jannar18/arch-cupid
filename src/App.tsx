import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex flex-col h-full items-center mx-auto p-4 h-screen overflow-hidden">
      <div className="flex flex-col h-full items-center gap-4 relative"> 
        <ScrollArea className="flex-1 min-h-0 w-[600px] max-w-2xl bg-gray-50 p-0"> 
          <div className="flex flex-col-reverse gap-4">
          {messages.map((message) => (
            <Card className={message.role === "user" 
              ? "bg-[#E34234] border-t-0 text-white mr-auto rounded-none" 
              : "bg-gray-100 border-t-0 border-gray-200 text-black ml-auto rounded-none"}>
              <CardContent className={message.role === "user" 
                ? "text-left" 
                : "text-right"}>
                {message.content}</CardContent>
            </Card>
          ))}
          </div>
        </ScrollArea>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-b from-transparent from-40% to-white/80 to-50% z-10">
          <div className="pointer-events-auto flex items-center gap-4 w-[600px] max-w-4xl z-20">
            <Textarea
              autoFocus
              className="min-h-[10px] border-t-0 border-gray-200 p-0 resize-none overflow-hidden rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-300 focus:bg-[#FDF3F2]"
              placeholder="Hey there."
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                event.target.style.height = "auto";
                event.target.style.height = event.target.scrollHeight + "px";
              }}
              onBlur={(e) => e.target.focus()}
              />
          <ArrowUpIcon
            className="size-8 text-[#E34234] stroke-[3] cursor-pointer hover:opacity-70"
            onClick={ sendMessage }></ArrowUpIcon>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
