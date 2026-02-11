

export type Message = { 
    role: "user" | "assistant";
    content: string;
};

export type Conversation = { 
    messages: Message[];
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
}

interface Storage { 
    createConversation(): Conversation;
    getConversation(id: string): Conversation | null;
    getConversations(): Conversation[];
    addMessageToConversation(id: string, message: Message): Conversation | null;
};

export class InMemoryStorage implements Storage {
    conversations: Record<string, Conversation> = {};

    createConversation(): Conversation {
        const conversation: Conversation = { 
            messages: [],
            id: crypto.randomUUID(),
            title: "New conversation",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
    this.conversations[conversation.id] = conversation; 
    return conversation;
    }

    getConversation(id:string): Conversation | null {
        return this.conversations[id] ?? null
    }

    getConversations(): Conversation[] {
        const allConversations = Object.values(this.conversations);
        allConversations.sort((a,b) => b.updatedAt - a.updatedAt);
        
        return allConversations;
    }

    addMessageToConversation(id: string, message: Message): Conversation | null {
        const conversation = this.conversations[id];
        if (!conversation) return null; 
        conversation.messages.push(message);
        conversation.updatedAt = Date.now();
        if (conversation.messages.length === 1 && message.role === "user") {
            conversation.title = message.content.slice(0, 50)
        }

        return conversation;
    }   

}