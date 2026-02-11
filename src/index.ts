import { serve } from "bun";
import index from "./index.html";
import Anthropic from "@anthropic-ai/sdk";


require('dotenv').config()

const anthropic = new Anthropic();
let messageHistory: {role: string, content: string}[] = [];

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        const message = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: [
            {role: "user", content: "Say hello in a fun way!"}
          ],
          }); 

        return Response.json(message);
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    "/api/chat": {
      async POST(req) {
        const body = await req.json();

        messageHistory.push({ role: "user", content: body.message});

        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: messageHistory,
        });

        const assistantMessage = response.content[0].type === "text"
          ? response.content[0].text: "";
        
        messageHistory.push({ role: "assistant", content: assistantMessage });

        return Response.json({ response: assistantMessage });
      },
    },

    "/api/reset": {
      async POST(req) {
        messageHistory = [];
        return Response.json({ message: "Conversation has been reset" });
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
