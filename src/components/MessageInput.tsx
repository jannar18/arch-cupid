import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon, ImageIcon, XIcon } from "lucide-react"
import { useState, useRef } from "react";

type ImageData = { data: string; media_type: string };

export function MessageInput ({ onSend, hasMessages }: { onSend: (message: string, image?: ImageData) => void, hasMessages: boolean }) {

const [input, setInput] = useState("");
const [image, setImage] = useState<ImageData | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
        const result = reader.result as string;
        // result is "data:<media_type>;base64,<data>"
        const base64 = result.split(",")[1]!;
        const media_type = file.type;
        setImage({ data: base64, media_type });
        setImagePreview(result);
    };
    reader.readAsDataURL(file);

    // Reset so the same file can be re-selected
    e.target.value = "";
};

const removeImage = () => {
    setImage(null);
    setImagePreview(null);
};

const handleSend = () => {
    if (!input.trim() && !image) return;
    onSend(input, image || undefined);
    setInput("");
    removeImage();
};

    return(
        <div className={`absolute inset-0 flex ${hasMessages ? "items-end pb-4" : "items-center"} justify-center pointer-events-none ${hasMessages ? "" : "bg-gradient-to-b from-transparent from-40% to-white/80 to-50%"} z-10`}>
        <div className="pointer-events-auto flex flex-col gap-2 w-full max-w-[600px] px-4 z-20">
            {imagePreview && (
                <div className="relative inline-block w-16 h-16">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded border border-gray-300"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute -top-1.5 -right-1.5 bg-[#E34234] text-white rounded-full p-0.5 cursor-pointer hover:opacity-70"
                    >
                        <XIcon className="size-3" />
                    </button>
                </div>
            )}
            <div className="flex items-center gap-4">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <ImageIcon
                    className="size-6 text-gray-400 cursor-pointer hover:text-[#E34234]"
                    onClick={() => fileInputRef.current?.click()}
                />
                <Textarea
                    autoFocus
                    className="min-h-0 border-t-0 border-gray-200 px-0 py-0 resize-none overflow-hidden rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-300 focus:bg-[#FDF3F2]"
                    placeholder="Upload or describe a building you love..."
                    value={input}
                    onChange={(event) => {
                        setInput(event.target.value);
                        event.target.style.height = "auto";
                        event.target.style.height = event.target.scrollHeight + "px";
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <ArrowUpIcon
                    className="size-8 text-[#E34234] stroke-[3] cursor-pointer hover:opacity-70"
                    onClick={handleSend}
                />
            </div>
        </div>
        </div>
    );
};
