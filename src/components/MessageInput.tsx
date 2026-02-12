import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon} from "lucide-react"
import { useState } from "react";


export function MessageInput ({ onSend }: { onSend: (message: string) => void}) { 

const [input, setInput] = useState("");

    return( 
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-b from-transparent from-40% to-white/80 to-50% z-10">
        <div className="pointer-events-auto flex items-center gap-4 w-[600px] max-w-4xl z-20">
            <Textarea
            autoFocus
            className="min-h-[10px] border-t-0 border-gray-200 p-0 resize-none overflow-hidden rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-300 focus:bg-[#FDF3F2]"
            placeholder="Hey there."
            value={input}
            onChange={(event) => {
                setInput(event.target.value);
                event.target.style.height = "auto";
                event.target.style.height = event.target.scrollHeight + "px";
            }}
            onBlur={(e) => e.target.focus()}
            />
        <ArrowUpIcon
            className="size-8 text-[#E34234] stroke-[3] cursor-pointer hover:opacity-70"
            onClick={ ()=> {
                onSend(input);
                setInput("");
            }} 
        ></ArrowUpIcon>
        </div>
        </div>
    );
};
