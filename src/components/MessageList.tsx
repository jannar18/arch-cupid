 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Card, CardContent } from "@/components/ui/card";

export function MessageList({ messages }: { messages: {role: string, content: string}[] }) {
return (
    <ScrollArea className="flex-1 min-h-0 w-[600px] max-w-2xl bg-gray-50 p-0"> 
              <div className="flex flex-col-reverse gap-4">
              {messages.map((message, index) => (
                <Card key={index} className={message.role === "user" 
                  ? "bg-[#E34234] border-t-0 text-white mr-auto rounded-none" 
                  : "bg-gray-100 border-t-0 border-gray-200 text-black ml-auto rounded-none"}>
                  <CardContent className={message.role === "user" 
                    ? "text-left" 
                    : "text-right"}>
                    {message.content}</CardContent>
                </Card>
              ))}
              </div>
            </ScrollArea>   
);
 };