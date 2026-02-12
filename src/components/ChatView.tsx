import {MessageList} from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useState, useEffect } from "react";
import { useParams } from "react-router";


export function ChatView() {
    const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
    const { chatId } = useParams();

        useEffect(() => {
            if (chatId) {
                fetch(`/api/conversations/${chatId}`)
                .then(res => res.json())
                .then(conversation => setMessages(conversation.messages));
            } else {
                setMessages([]);
            }
            }, [chatId]);
        
        const sendMessage = async (message:string) => {
            const response = await fetch( `/api/conversations/${chatId}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({message: message}),
            });
            const data = await response.json();
            
            setMessages([...messages,
            {role: "user", content: message},
            {role: "assistant", content: data.response},
            ]);
        };

    return (
        <div className="flex flex-col h-full items-center gap-4 relative">
            <MessageList messages={messages} />
            <MessageInput onSend={sendMessage} />
        </div>  
    )

}


