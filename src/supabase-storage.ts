import { createClient } from "@supabase/supabase-js";
import type { Storage, Message, Conversation } from "./storage";

export const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

export class SupabaseStorage implements Storage {

    async createConversation(userId: string): Promise<Conversation> {
        const conversation: Conversation = {
            messages: [],
            id: crypto.randomUUID(),
            title: "New conversation",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await supabase.from("conversations").insert({
            id: conversation.id,
            user_id: userId,
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        });

        return conversation;
    }

    async getConversation(id: string, userId: string): Promise<Conversation | null> {
        const { data: conversationRow } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (!conversationRow) return null;

        const { data: messageRows } = await supabase
            .from("messages")
            .select("role, content, match_data")
            .eq("chatId", id)
            .order("createdAt", { ascending: true });

        return {
            id: conversationRow.id,
            title: conversationRow.title,
            createdAt: conversationRow.createdAt,
            updatedAt: conversationRow.updatedAt,
            messages: messageRows ?? [],
        };
    }

    async getConversations(userId: string): Promise<Conversation[]> {
        const { data: rows } = await supabase
            .from("conversations")
            .select("*")
            .eq("user_id", userId)
            .order("updatedAt", { ascending: false });

        if (!rows) return [];

        const conversations: Conversation[] = [];
        for (const row of rows) {
            const { data: messageRows } = await supabase
                .from("messages")
                .select("role, content, match_data")
                .eq("chatId", row.id)
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

        await supabase.from("messages").insert({
            id: messageId,
            chatId: id,
            role: message.role,
            content: message.content,
            match_data: message.match_data ?? null,
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
            .eq("chatId", id);

        if (count === 1 && message.role === "user") {
            await supabase
                .from("conversations")
                .update({ title: message.content.slice(0, 50) })
                .eq("id", id);
        }

        return this.getConversation(id, conversationRow.user_id);
    }
}
