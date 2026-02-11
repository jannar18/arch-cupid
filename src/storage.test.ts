import { describe, test, expect, beforeEach } from "bun:test";
import { InMemoryStorage } from "./storage";

describe("InMemoryStorage", () => {
    let storage: InMemoryStorage;

    beforeEach (() => {
        storage = new InMemoryStorage();
    });
 
    describe("createConversation", () => {

    //test ensures new conversations are assigned a specific id 
        test("returns a conversation with an id", () => {
            const conversation = storage.createConversation();
            expect(conversation.id).toBeDefined();
        });
    //test ensures new conversations have messages cleared
        test("returns a new conversation with no messages", () => {
            const conversation = storage.createConversation();
            expect(conversation.messages).toEqual([])
        }); 
    //test ensures new conversations store a timestamp at creation
        test("returns a conversation with a timestamp", () => {
            const conversation = storage.createConversation();
            expect(conversation.createdAt).toBeDefined(); 
        }); 
    //test ensures new conversations store a timestamp at creation
        test("creates conversations with unique IDs", () => {
            const conversation1 = storage.createConversation();
            const conversation2 = storage.createConversation();
            expect(conversation1.id).not.toBe(conversation2.id);
        });
    });

    describe("getConversation", () => {
        
        test("returns a conversation by grabbing its id", () => {
            const created = storage.createConversation();
            const found = storage.getConversation(created.id);

            expect(found).not.toBeNull();
            expect(found!.id).toBe(created.id); 
        });

        test("returns null for a non-existent id", () => {
            const found = storage.getConversation("fake-id");
            expect(found).toBeNull();
        });

    });

    describe("getConversations", () => {
        
        test("returns empty array if no conversations have been created", () => {
            const conversations = storage.getConversations();
            expect(conversations).toEqual([])
        });
        test("returns an array of all created conversations", () => {
            storage.createConversation();
            storage.createConversation();
            storage.createConversation();
            const conversations = storage.getConversations();
            expect(conversations).toHaveLength(3);
        });
        test("newly added to conversation should be updated to return to the top of the array", () => {
            const conversation1 = storage.createConversation();
            const conversation2 = storage.createConversation();

            storage.addMessageToConversation(conversation1.id, {
                role:"user",
                content:"hey i'm joining an my earlier conversation"
            }); 
        
            const list = storage.getConversations();
            expect(list[0].id).toBe(conversation1.id);
        });
    });

    describe("addMessageToConversation", () => {

        test("new added message gets added into the conversation", () => {
            const conversation = storage.createConversation()
            const result = storage.addMessageToConversation(conversation.id, {
                role:"user",
                content:"this is my new message",
            });

            expect(result!.messages).toHaveLength(1);
            expect(result!.messages[0]).toEqual({
                role:"user",
                content:"this is my new message",
            });
        });

        test("returns null for a non-existent id", () => {
            const found = storage.addMessageToConversation("fake-id", {
                role: "user",
                content: "hello",
            });
            expect(found).toBeNull();
        });

        test("sending a new message updates the conversation timestamp", () => {
            const conversation = storage.createConversation();
            const originalUpdatedAt = conversation.updatedAt;

            storage.addMessageToConversation(conversation.id, {
                role:"user",
                content:"hey i'm joining an my earlier conversation"
            }); 
        
            const updated = storage.getConversation(conversation.id);
            expect(updated!.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
        });

        test("title is created from first user message", () => {
            const conversation = storage.createConversation();

            storage.addMessageToConversation(conversation.id, { 
                role:"user",
                content:"hi this is my first message"
            });
            const updated = storage.getConversation(conversation.id);
            expect(updated!.title).toBe("hi this is my first message")
        });

        test("multiple message stay in order", () => { 
            const conversation = storage.createConversation();

            storage.addMessageToConversation(conversation.id, { 
                role:"user",
                content:"first"
            });
            storage.addMessageToConversation(conversation.id, { 
                role:"user",
                content:"second"
            });
            storage.addMessageToConversation(conversation.id, { 
                role:"user",
                content:"third"
            });
            const updated = storage.getConversation(conversation.id);
            expect(updated!.messages[0]!.content).toBe("first");
            expect(updated!.messages[1]!.content).toBe("second");
            expect(updated!.messages[2]!.content).toBe("third");
        });
    });

});