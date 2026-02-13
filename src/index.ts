import { serve } from "bun";
import index from "./index.html";
import Anthropic from "@anthropic-ai/sdk";
import { SupabaseStorage } from "./supabase-storage";
import { auth } from "./lib/auth";

require('dotenv').config()

const anthropic = new Anthropic();
const storage = new SupabaseStorage();

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/auth/*": {
      async GET(req) { 
        return auth.handler(req);
      },
      async POST(req) {
        return auth.handler(req);
      },
    },

    "/api/conversations": {
      async POST(req) {
        const session = await auth.api.getSession({ headers: req.headers })
        if (!session) {
          return Response.json({ error: "Unauthorized" }, { status: 401})
        }
        const conversation = await storage.createConversation(session.user.id);
        return Response.json(conversation);
      },
      async GET(req) {
        const session = await auth.api.getSession({ headers: req.headers })
        if (!session) {
          return Response.json({ error: "Unauthorized" }, { status: 401})
        }
        return Response.json(await storage.getConversations(session.user.id));
      },
    },

    "/api/conversations/:id": {
      async GET(req) {
        const session = await auth.api.getSession({ headers: req.headers })
        if (!session) {
          return Response.json({ error: "Unauthorized" }, { status: 401})
        }
        const conversation = await storage.getConversation(req.params.id, session.user.id);
        if (!conversation) {
          return Response.json({error: "Conversation not found"}, {
          status:404});
        }
        return Response.json(conversation);
      },
    },

    "/api/conversations/:id/chat": {
      async POST(req) {
        const session = await auth.api.getSession({ headers: req.headers })
        if (!session) {
          return Response.json({ error: "Unauthorized" }, { status: 401})
        }
        const id = req.params.id;
        const body = await req.json(); 

        const conversation = await storage.addMessageToConversation(id, {
          role:"user",
          content: body.message,
        }); 
        if (!conversation ) {
            return Response.json({error: "Conversation not found"}, {
            status:404
        });
        }
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: conversation.messages,
        });

        const assistantMessage = response.content[0].type === "text"
          ? response.content[0].text : "";
        
        await storage.addMessageToConversation(id, {
          role: "assistant",
          content: assistantMessage, 
        });

        return Response.json({ response: assistantMessage });
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
