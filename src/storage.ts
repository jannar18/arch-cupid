

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

export interface Storage {
    createConversation(userId: string): Promise<Conversation>;
    getConversation(id: string, userId: string): Promise<Conversation | null>;
    getConversations(userId: string): Promise<Conversation[]>;
    addMessageToConversation(id: string, message: Message): Promise<Conversation | null>;
};

export class InMemoryStorage implements Storage {
    conversations: Record<string, Conversation> = {};

    async createConversation(): Promise<Conversation> {
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

    async getConversation(id:string): Promise<Conversation | null> {
        return this.conversations[id] ?? null
    }

    async getConversations(): Promise<Conversation[]> {
        const allConversations = Object.values(this.conversations);
        allConversations.sort((a,b) => b.updatedAt - a.updatedAt);
        
        return allConversations;
    }

    async addMessageToConversation(id: string, message: Message): Promise<Conversation | null> {
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