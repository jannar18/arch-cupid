import { useNavigate } from "react-router";


export const useCreateConversation = (refreshConversations: () => void ) => {
    const navigate = useNavigate()
    const createNewConversation = async () => { 
        const res = await fetch("/api/conversations", { method: "POST"});
        const newChat = await res.json();
        navigate(`/chat/${newChat.id}`);
        refreshConversations();
        return newChat.id
        };
    
    return createNewConversation
    
}