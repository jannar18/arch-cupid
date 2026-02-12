import { createClient } from "@supabase/supabase-js";
import type { Storage, Message, Conversation } from "./storage";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

export class SupabaseStorage implements Storage {

    async createConversation(): Promise<Conversation> {
        const conversation: Conversation = {
            messages: [],
            id: crypto.randomUUID(),
            title: "New conversation",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await supabase.from("conversations").insert({
            id: conversation.id,
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        });

        return conversation;
    }

    async getConversation(id: string): Promise<Conversation | null> {
        const { data: conversationRow } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", id)
            .single();

        if (!conversationRow) return null;

        const { data: messageRows } = await supabase
            .from("messages")
            .select("role, content")
            .eq("conversationId", id)
            .order("createdAt", { ascending: true });

        return {
            id: conversationRow.id,
            title: conversationRow.title,
            createdAt: conversationRow.createdAt,
            updatedAt: conversationRow.updatedAt,
            messages: messageRows ?? [],
        };
    }

    async getConversations(): Promise<Conversation[]> {
        const { data: rows } = await supabase
            .from("conversations")
            .select("*")
            .order("updatedAt", { ascending: false });

        if (!rows) return [];

        const conversations: Conversation[] = [];
        for (const row of rows) {
            const { data: messageRows } = await supabase
                .from("messages")
                .select("role, content")
                .eq("conversationId", row.id)
                .order("createdAt", { ascending: true });

            conversations.push({
                id: row.id,
                title: row.title,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                messages: messageRows ?? [],
            });
        }

        return conversations;
    }

    async addMessageToConversation(id: string, message: Message): Promise<Conversation | null> {
        const { data: conversationRow } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", id)
            .single();

        if (!conversationRow) return null;

        const messageId = crypto.randomUUID();
        const now = Date.now();

        // INSERT the message
        await supabase.from("messages").insert({
            id: messageId,
            conversationId: id,
            role: message.role,
            content: message.content,
            createdAt: now,
        });

        // UPDATE the conversation's updatedAt
        await supabase
            .from("conversations")
            .update({ updatedAt: now })
            .eq("id", id);

        // Auto-set title from first user message
        const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversationId", id);

        if (count === 1 && message.role === "user") {
            await supabase
                .from("conversations")
                .update({ title: message.content.slice(0, 50) })
                .eq("id", id);
        }

        return this.getConversation(id);
    }
}
