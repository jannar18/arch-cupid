import { Drawer,DrawerClose,DrawerContent,DrawerHeader,DrawerTrigger } from "@/components/ui/drawer";
import { PlusIcon } from "lucide-react"
import { useState } from "react";
import { useNavigate } from "react-router";
import type { Conversation } from "../storage";
import { useCreateConversation } from "src/useCreateConversation";

export function SideBar({ conversations, refreshConversations }: {
    conversations: Conversation[],
    refreshConversations: () => void
}) {

const [drawerOpen, setDrawerOpen] = useState(false);
const createNewConversation = useCreateConversation(refreshConversations);

const navigate = useNavigate();
      const selectConversation = async (id: string) => {
        navigate(`/chat/${id}`);
        setDrawerOpen(false);
      };

return (
    <div className="w-full flex justify-start">
        <Drawer direction="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
            
            <DrawerTrigger>
                <PlusIcon className="size-8 text-[#E34234] stroke-[3] cursor-pointer hover:opacity-70">
                </PlusIcon>
            </DrawerTrigger>

            <DrawerContent>
                <DrawerHeader className="bg-[#E34234] p-0">
                <h2 className="!text-white text-normal text-3x1">Conversations</h2>
                </DrawerHeader>
                <button><PlusIcon
                className="size-8 text-[#E34234] stroke-[3] cursor-pointer hover:opacity-70"
                onClick={async () => {
                    await createNewConversation();
                    setDrawerOpen(false);
                }}></PlusIcon>
                </button>
                {conversations.map((conversation) => (
                    <div key={conversation.id}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => selectConversation(conversation.id)}
                    >
                    {conversation.title}
                    </div>
                ))}
            </DrawerContent>
        </Drawer>
    </div>
      );
}