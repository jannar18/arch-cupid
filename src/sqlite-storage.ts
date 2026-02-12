import { Database } from "bun:sqlite";
import type { Storage, Message, Conversation } from "./storage";

const db = new Database("chat.db");
db.run("PRAGMA journal_mode = WAL");

// Create tables if they don't already exist
db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt INTEGER NOT NULL
    )
`);

export class SqliteStorage implements Storage {

// INSERT, SELECT, UPDATE, DELETE
// I need to set up tables in a database server that hold Conversation Data and Message Data
// Conversation: conversationId, title, createdAt, updatedAt
// Messages: id, conversationId, role, content, createdAt

    async createConversation(): Promise<Conversation> {
        //createConversation - INSERT INTO conversations
        const conversation: Conversation = {
            messages: [],
            id: crypto.randomUUID(),
            title: "New conversation",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        // INSERT a new row into the conversations table
        db.run(
            "INSERT INTO conversations (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)",
            [conversation.id, conversation.title, conversation.createdAt, conversation.updatedAt]
        );
        return conversation;
    }

    async getConversation(id: string): Promise<Conversation | null> {
        //getConversation - SELECT FROM conversations - need id
        const conversationRow = db.query("SELECT * FROM conversations WHERE id = ?").get(id) as any;
        // If no row found, conversation doesn't exist
        if (!conversationRow) return null;

        // SELECT all messages that belong to this conversation, ordered by creation time
        const messageRows = db.query(
            "SELECT role, content FROM messages WHERE conversationId = ? ORDER BY createdAt ASC"
        ).all(id) as any[];

        // Assemble the Conversation object from the two queries
        return {
            id: conversationRow.id,
            title: conversationRow.title,
            createdAt: conversationRow.createdAt,
            updatedAt: conversationRow.updatedAt,
            messages: messageRows,
        };
    }

    async getConversations(): Promise<Conversation[]> {
        //getConversations - SELECT FROM conversations - all columns
        const rows = db.query("SELECT * FROM conversations ORDER BY updatedAt DESC").all() as any[];

        // For each conversation row, get its messages and assemble the full object
        return rows.map((row) => {
            const messageRows = db.query(
                "SELECT role, content FROM messages WHERE conversationId = ? ORDER BY createdAt ASC"
            ).all(row.id) as any[];

            return {
                id: row.id,
                title: row.title,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                messages: messageRows,
            };
        });
    }

    async addMessageToConversation(id: string, message: Message): Promise<Conversation | null> {
        //addMessageToConversation - INSERT INTO messages - id, conversationId, role, content, createdAt
        //addMessageToConversation - UPDATE conversations - updatedAt
        const conversationRow = db.query("SELECT * FROM conversations WHERE id = ?").get(id) as any;
        if (!conversationRow) return null;

        // Generate an id and timestamp for the new message
        const messageId = crypto.randomUUID();
        const now = Date.now();

        // INSERT the message into the messages table
        db.run(
            "INSERT INTO messages (id, conversationId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)",
            [messageId, id, message.role, message.content, now]
        );

        // UPDATE the conversation's updatedAt timestamp
        db.run(
            "UPDATE conversations SET updatedAt = ? WHERE id = ?",
            [now, id]
        );

        // Auto-set title from first user message
        const messageCount = db.query(
            "SELECT COUNT(*) as count FROM messages WHERE conversationId = ?"
        ).get(id) as any;

        if (messageCount.count === 1 && message.role === "user") {
            db.run(
                "UPDATE conversations SET title = ? WHERE id = ?",
                [message.content.slice(0, 50), id]
            );
        }

        // Return the full updated conversation
        return this.getConversation(id);
    }
}
