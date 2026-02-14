 import { Card, CardContent } from "@/components/ui/card";
 import { HeartIcon } from "lucide-react";
 import { useEffect, useRef } from "react";
 import type { ChatMessage, MatchData } from "./ChatView";

function HeartShape({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 300 280" className="w-full h-full absolute inset-0">
        <defs>
          <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E34234" />
            <stop offset="100%" stopColor="#F2A0A0" />
          </linearGradient>
        </defs>
        <path
          d="M150 35 C150 35 125 0 87.5 0 C39 0 0 39 0 87.5 C0 145 60 190 150 265 C240 190 300 145 300 87.5 C300 39 261 0 212.5 0 C175 0 150 35 150 35Z"
          fill="url(#heartGrad)"
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center h-full">
        {children}
      </div>
    </div>
  );
}

function ValentineCard({ match }: { match: MatchData }) {
  return (
    <a href="/wall"  className="w-full flex flex-col items-center py-4 cursor-pointer no-underline">
      {/* Heart with photo inside */}
      <HeartShape className="w-64 h-60">
        <div className="flex flex-col items-center pt-6">
          {match.architectImage ? (
            <img
              src={match.architectImage}
              alt={match.architectName}
              className="w-20 h-20 object-cover rounded-full border-3 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-3 border-white bg-white/30 flex items-center justify-center">
              <HeartIcon className="size-8 text-white fill-white" />
            </div>
          )}
          <p className="text-white font-bold text-sm mt-2 drop-shadow text-center px-8">
            It's a Match!
          </p>
        </div>
      </HeartShape>

      {/* Info below the heart */}
      <div className="bg-pink-50 rounded-2xl px-6 py-5 -mt-6 w-full max-w-[280px] text-center shadow-lg border border-pink-200">
        <h3 className="text-xl font-bold text-[#E34234]">
          {match.architectName}
        </h3>

        <span className="inline-block text-xs font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full mt-2">
          {match.style}
        </span>

        {match.tagline && (
          <p className="text-sm italic text-[#E34234]/70 mt-3">
            "{match.tagline}"
          </p>
        )}

        {/* Heart divider */}
        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-pink-200" />
          <HeartIcon className="size-3 text-pink-300 fill-pink-300" />
          <div className="flex-1 h-px bg-pink-200" />
        </div>

        <p className="text-xs text-gray-500">
          {match.summary}
        </p>

        <p className="text-xs text-pink-400 font-medium mt-3">
          Tap to see the Wall of Love
        </p>
      </div>
    </a>
  );
}

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const lastMsgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay so the card renders fully before scrolling
    setTimeout(() => {
      lastMsgRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [messages]);

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="flex flex-col gap-4 px-2 pt-4 pb-64 max-w-[600px] mx-auto">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          return message.role === "user" ? (
            <Card key={index} className="bg-[#E34234] border-t-0 text-white mr-auto rounded-none max-w-[85%]">
              <CardContent className="text-left">
                {message.content}
              </CardContent>
            </Card>
          ) : message.matchData ? (
            <div key={index} ref={isLast ? lastMsgRef : undefined}>
              <ValentineCard match={message.matchData} />
            </div>
          ) : (
            <div key={index} ref={isLast ? lastMsgRef : undefined} className="ml-auto max-w-[85%] rounded-xl overflow-hidden shadow border-2 border-pink-200"
              style={{ background: "linear-gradient(135deg, #E34234 0%, #E85D50 30%, #F2A0A0 60%, #FBD5D5 100%)" }}>
              <div className="flex items-center justify-center gap-1 py-1.5">
                <HeartIcon className="size-2.5 text-white fill-white" />
                <HeartIcon className="size-3 text-white fill-white" />
                <HeartIcon className="size-2.5 text-white fill-white" />
              </div>
              <div className="bg-white mx-2 mb-2 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          );
        })}
        <div />
      </div>
    </div>
  );
};
