import {MessageList} from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useCreateConversation } from "src/useCreateConversation";

export type MatchData = {
    architectName: string;
    style: string;
    tagline: string;
    summary: string;
    architectImage: string | null;
};

export type ChatMessage = {
    role: string;
    content: string;
    matchData?: MatchData | null;
};

export function ChatView ({ refreshConversations }: {
    refreshConversations: () => void
}) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const { chatId } = useParams();
    const createNewConversation = useCreateConversation(refreshConversations);

    useEffect(() => {
        if (chatId) {
            fetch(`/api/conversations/${chatId}`)
                .then(res => res.json())
                .then(conversation => setMessages(
                    conversation.messages.map((msg: any) => ({
                        role: msg.role,
                        content: msg.content,
                        matchData: msg.match_data ?? null,
                    }))
                ));
        } else {
            setMessages([]);
        }
    }, [chatId]);

    const sendMessage = async (message: string, image?: { data: string; media_type: string }) => {
        let id = chatId;
        if (!chatId) {
            id = await createNewConversation();
        }

        const response = await fetch(`/api/conversations/${id}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, image }),
        });

        const data = await response.json();

        const userContent = image ? `[Image attached] ${message}` : message;
        setMessages(prev => [...prev,
            { role: "user", content: userContent },
            { role: "assistant", content: data.response, matchData: data.matchData },
        ]);
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full items-center relative overflow-hidden">
            <MessageList messages={messages} />
            <MessageInput onSend={sendMessage} hasMessages={messages.length > 0} />
        </div>
    );
};
