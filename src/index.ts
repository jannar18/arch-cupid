import { serve } from "bun";
import index from "./index.html";
import Anthropic from "@anthropic-ai/sdk";
import { SupabaseStorage, supabase } from "./supabase-storage";
import { auth } from "./lib/auth";

require('dotenv').config()

const anthropic = new Anthropic();
const storage = new SupabaseStorage();

const SYSTEM_PROMPT = `You are a Valentines Arch-Cupid - knowledgable, charming, architecture expert Valentine matchmaker this Valentine's Day. Instead of matching singles to couple up, you will be helping users match with their Architect Valentine Soulmate. Introduce yourself in this way and prompt the user to do the following:

Users can either:
1. Upload a photo of a building, room, aesthetic or architectural style they love
2. Describe a building, room, aesthetic or architectural style they love

Based on the user's input you will:
1. Analyze and identify the architectural style or styles - your analysis should be rooted in very specific details about the style they described or the photo they provided; decide the style based on specific feature like: building materials, proportions, structural systems, ornamentation, spatial qualities, window patterns, roof forms, facade composition. Try to determine which era and which region the style is from (this can especially help inform the Architect to choose). Be specific about what you see and why it points to a particular style. If the style is ambiguous, you should acknowledge that and in your response be a bit more mysterious…say "this appears to be" or offer a secondary possibility. Never guess confidently if you're unsure. You don't want to share fake facts.
2. Match the user with their Architect Valentine Soulmate - Based on the architectural styles, era and regions the user description or photo aligns with, make a well thought out and educated decision on which Architect has designed in this style before. Be as accurate as possible about this. Briefly explain who the architect is, what they're known for, and why they're a perfect match.
3. Write a Valentines Dating Profile Card response - this response should be like a match on a dating profile. Make it witty, charming, cute, descriptive. You can use metaphors. Make the match personal to the user and architect they got matched with.

Response Format
Keep your response concise aim for 150-200 words total.
Structure it like:
The Style You Described: 2-3 sentences analyzing the style with specific visual evidence and descriptors using architecture vocabulary.
Your Valentines Soulmate: [Architect Name] — 3-4 sentences on who they are and why you're a match. End with a fun, memorable one-liner (like a dating tagline for the architect).

Important Guidelines
* Be accurate and descriptive. Base your style identification on real architectural features, not guesses. If you see exposed concrete and modular repetition, say that. If you see pointed arches and flying buttresses, say that. Show your reasoning.
* Handle ambiguity gracefully. If a building is eclectic you can say so like "This building seems to borrow from several traditions..." is better than a wrong confident answer. Everyday or vernacular buildings may be submitted — find something interesting to say about them.
* Keep architect matches diverse. Don't default to the same 5 famous names every time. Pull from a wide range of architects across eras, regions, and styles.
* If the input is vague, ask one short clarifying question to narrow it down, then give the match.
* Have fun with it. This is a Valentine's Day game. Be playful. Be clever. Make people smile.
* Don't act like a marketer or be overbearing, be less wordy and fancy. Lets make this sweet and funny and clever
After giving your match response, include a hidden JSON block at the very end of your message in this exact format:

:::LOVE_PROFILE:::
{"architect": "Antoni Gaudí", "style": "Gothic Romance", "tagline": "I like my curves structural and my romance eternal.", "summary": "You fall for drama, darkness, and soaring ambition. Your dream building has pointed arches and a mysterious past."}
:::END_PROFILE:::

The "architect" should be the full name of the matched architect.
The "style" should be a fun, romantic name for their architectural taste (2-4 words).
The "tagline" should be a flirty one-liner dating tagline from the architect (first person).
The "summary" should be 1-2 sentences describing their architectural love language, incorporating the architect match.

Only generate ONE love profile per conversation. Do NOT mention the profile block to the user — it's extracted automatically.`;

const server = serve({
  port: process.env.PORT || 3000,
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

        // Image size guard (5MB)
        if (body.image?.data) {
          const sizeInBytes = Math.ceil(body.image.data.length * 3 / 4);
          if (sizeInBytes > 5 * 1024 * 1024) {
            return Response.json({ error: "Image too large (max 5MB)" }, { status: 413 });
          }
        }

        // Store text-only version in DB
        const dbContent = body.image
          ? `[Image attached] ${body.message}`
          : body.message;

        const conversation = await storage.addMessageToConversation(id, {
          role:"user",
          content: dbContent,
        });
        if (!conversation) {
            return Response.json({error: "Conversation not found"}, {
            status:404
          });
        }

        // Build messages for Anthropic API
        // For the last user message, use multimodal content blocks if image present
        const apiMessages = conversation.messages.map((msg, i) => {
          if (i === conversation.messages.length - 1 && msg.role === "user" && body.image) {
            return {
              role: "user" as const,
              content: [
                {
                  type: "image" as const,
                  source: {
                    type: "base64" as const,
                    media_type: body.image.media_type,
                    data: body.image.data,
                  },
                },
                ...(body.message ? [{ type: "text" as const, text: body.message }] : []),
              ],
            };
          }
          return { role: msg.role as "user" | "assistant", content: msg.content };
        });

        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        });

        const firstBlock = response.content[0];
        let assistantMessage = firstBlock && "text" in firstBlock
          ? firstBlock.text : "";


        // Extract love profile if present
        let matchData: {
          architectName: string;
          style: string;
          tagline: string;
          summary: string;
          architectImage: string | null;
        } | null = null;

        const profileMatch = assistantMessage.match(
          /:::LOVE_PROFILE:::\s*(\{[\s\S]*?\})\s*:::END_PROFILE:::/
        );
        if (profileMatch) {
          try {
            const profile = JSON.parse(profileMatch[1]!);

            // Fetch architect portrait from Wikipedia
            let architectImage: string | null = null;
            if (profile.architect) {
              try {
                const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(profile.architect)}`;
                const wikiRes = await fetch(wikiUrl);
                if (wikiRes.ok) {
                  const wikiData = await wikiRes.json();
                  if (wikiData.thumbnail?.source) {
                    architectImage = wikiData.thumbnail.source;
                  }
                }
              } catch (e) {
                // Wikipedia lookup failed — continue without image
              }
            }

            matchData = {
              architectName: profile.architect || "Unknown",
              style: profile.style || "",
              tagline: profile.tagline || "",
              summary: profile.summary || "",
              architectImage,
            };

            await supabase.from("love_profiles").insert({
              user_name: session.user.name || "Anonymous",
              user_image: session.user.image || null,
              user_prompt: body.message || "",
              style: profile.style,
              summary: profile.summary,
              architect_name: profile.architect || null,
              architect_image: architectImage,
            });
          } catch (e) {
            console.error("Failed to save love profile:", e);
          }
          // Strip the profile block and add wall link
          assistantMessage = assistantMessage
            .replace(/:::LOVE_PROFILE:::[\s\S]*?:::END_PROFILE:::/, "")
            .trim();
          assistantMessage += "\n\nSee your profile on the Wall of Love: /wall";
        }

        await storage.addMessageToConversation(id, {
          role: "assistant",
          content: assistantMessage,
          match_data: matchData,
        });

        return Response.json({ response: assistantMessage, matchData });
      },
    },

    "/api/wall": {
      async GET() {
        const { data, error } = await supabase
          .from("love_profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }
        return Response.json(data);
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
