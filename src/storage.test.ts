import { describe, test, expect, beforeEach } from "bun:test";
import { InMemoryStorage } from "./storage";
import { SqliteStorage } from "./sqlite-storage";
import { Database } from "bun:sqlite";

// Open a connection to clear SQLite tables between tests
const testDb = new Database("chat.db");

function defineStorageTests(createStorage: () => any, cleanup?: () => void) {
    let storage: any;

    beforeEach (() => {
        if (cleanup) cleanup();
        storage = createStorage();
    });

    describe("createConversation", () => {

    //test ensures new conversations are assigned a specific id
        test("returns a conversation with an id", async () => {
            const conversation = await storage.createConversation();
            expect(conversation.id).toBeDefined();
        });
    //test ensures new conversations have messages cleared
        test("returns a new conversation with no messages", async () => {
            const conversation = await storage.createConversation();
            expect(conversation.messages).toEqual([])
        });
    //test ensures new conversations store a timestamp at creation
        test("returns a conversation with a timestamp", async () => {
            const conversation = await storage.createConversation();
            expect(conversation.createdAt).toBeDefined();
        });
    //test ensures new conversations store a timestamp at creation
        test("creates conversations with unique IDs", async () => {
            const conversation1 = await storage.createConversation();
            const conversation2 = await storage.createConversation();
            expect(conversation1.id).not.toBe(conversation2.id);
        });
    });

    describe("getConversation", () => {

        test("returns a conversation by grabbing its id", async () => {
            const created = await storage.createConversation();
            const found = await storage.getConversation(created.id);

            expect(found).not.toBeNull();
            expect(found!.id).toBe(created.id);
        });

        test("returns null for a non-existent id", async () => {
            const found = await storage.getConversation("fake-id");
            expect(found).toBeNull();
        });

    });

    describe("getConversations", () => {

        test("returns empty array if no conversations have been created", async () => {
            const conversations = await storage.getConversations();
            expect(conversations).toEqual([])
        });
        test("returns an array of all created conversations", async () => {
            await storage.createConversation();
            await storage.createConversation();
            await storage.createConversation();
            const conversations = await storage.getConversations();
            expect(conversations).toHaveLength(3);
        });
        test("newly added to conversation should be updated to return to the top of the array", async () => {
            const conversation1 = await storage.createConversation();
            const conversation2 = await storage.createConversation();

            await storage.addMessageToConversation(conversation1.id, {
                role:"user",
                content:"hey i'm joining an my earlier conversation"
            });

            const list = await storage.getConversations();
            expect(list[0].id).toBe(conversation1.id);
        });
    });

    describe("addMessageToConversation", () => {

        test("new added message gets added into the conversation", async () => {
            const conversation = await storage.createConversation()
            const result = await storage.addMessageToConversation(conversation.id, {
                role:"user",
                content:"this is my new message",
            });

            expect(result!.messages).toHaveLength(1);
            expect(result!.messages[0]).toEqual({
                role:"user",
                content:"this is my new message",
            });
        });

        test("returns null for a non-existent id", async () => {
            const found = await storage.addMessageToConversation("fake-id", {
                role: "user",
                content: "hello",
            });
            expect(found).toBeNull();
        });

        test("sending a new message updates the conversation timestamp", async () => {
            const conversation = await storage.createConversation();
            const originalUpdatedAt = conversation.updatedAt;

            await storage.addMessageToConversation(conversation.id, {
                role:"user",
                content:"hey i'm joining an my earlier conversation"
            });

            const updated = await storage.getConversation(conversation.id);
            expect(updated!.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
        });

        test("title is created from first user message", async () => {
            const conversation = await storage.createConversation();

            await storage.addMessageToConversation(conversation.id, {
                role:"user",
                content:"hi this is my first message"
            });
            const updated = await storage.getConversation(conversation.id);
            expect(updated!.title).toBe("hi this is my first message")
        });

        test("multiple message stay in order", async () => {
            const conversation = await storage.createConversation();

            await storage.addMessageToConversation(conversation.id, {
                role:"user",
                content:"first"
            });
            await storage.addMessageToConversation(conversation.id, {
                role:"user",
                content:"second"
            });
            await storage.addMessageToConversation(conversation.id, {
                role:"user",
                content:"third"
            });
            const updated = await storage.getConversation(conversation.id);
            expect(updated!.messages[0]!.content).toBe("first");
            expect(updated!.messages[1]!.content).toBe("second");
            expect(updated!.messages[2]!.content).toBe("third");
        });
    });
}

describe("InMemoryStorage", () => {
    defineStorageTests(() => new InMemoryStorage());
});

describe("SqliteStorage", () => {
    defineStorageTests(
        () => new SqliteStorage(),
        () => {
            // Clear both tables before each test so tests don't interfere
            testDb.run("DELETE FROM messages");
            testDb.run("DELETE FROM conversations");
        }
    );
});
