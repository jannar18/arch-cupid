import {MessageList} from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useCreateConversation } from "src/useCreateConversation";

export function ChatView ({ refreshConversations }: {
    refreshConversations: () => void
}) {
    const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
    const { chatId } = useParams();
    const createNewConversation = useCreateConversation(refreshConversations);

    useEffect(() => {
        if (chatId) {
            fetch(`/api/conversations/${chatId}`)
                .then(res => res.json())
                .then(conversation => setMessages(conversation.messages));
        } else {
            setMessages([]);
        }
    }, [chatId]);

    const sendMessage = async (message: string) => {
        let id = chatId;
        if (!chatId) {
            id = await createNewConversation();
        }

        const response = await fetch(`/api/conversations/${id}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();

        setMessages([...messages,
            { role: "user", content: message },
            { role: "assistant", content: data.response },
        ]);
    };

    return (
        <div className="flex flex-col h-full items-center gap-4 relative">
            <MessageList messages={messages} />
            <MessageInput onSend={sendMessage} />
        </div>
    );
};
