import { useQuery } from "react-query";
import { useParams,useNavigate } from "react-router-dom";
import { getAssistant } from "../api/assistants";
import { getThread } from "../api/threads";
import useChatRolAuth from "./useChatRolAuth";


function useThreadAndAssistant() {
  // Extract route parameters
  const { chatId, assistantId } = useParams();
  const { authToken} = useChatRolAuth();
  const navigate = useNavigate();


    // React Query to fetch chat details if chatId is present  
    const { data: currentChat, isLoading: isLoadingChat } = useQuery(  
      ["thread", chatId],  
      () => getThread(chatId as string, authToken),  
      {  
        enabled: !!chatId,  
        onSuccess: (data) => {  
          // If getThread returns empty content, navigate to /signin  
          if (!data || Object.keys(data).length === 0) {  
            //console.log(' useThreadAndAssistant 1 triggered')
           //navigate('/signin', { state: { from: '/' } });  
          }  
        },  
        onError: (error) => {
          console.log(error)  
          //alert(error)
          // If there's an error fetching the thread, navigate to /signin  
          navigate('/signin', { state: { from: '/' } });  
        }  
      },  
    );  
    
  
  // Determine the assistantId to use: either from the chat or the route directly
  const effectiveAssistantId = assistantId || currentChat?.assistant_id;

  // React Query to fetch assistant configuration based on the effectiveAssistantId
  const { data: assistantConfig, isLoading: isLoadingAssistant } = useQuery(
    ["assistant", effectiveAssistantId],
    () => getAssistant(effectiveAssistantId as string,authToken),
    {
      enabled: !!effectiveAssistantId,
      onSuccess: (data) => {  
        // If getThread returns empty content, navigate to /signin  
        if (!data || Object.keys(data).length === 0) {  
          //console.log(' useThreadAndAssistant 2 triggered')
         //navigate('/signin', { state: { from: '/' } });  
        }  
      },  
      onError: (error) => {  
        console.log(error)
        //alert(error)
        // If there's an error fetching the thread, navigate to /signin  
        navigate('/signin', { state: { from: '/' } });  
      } 
    },
  );

  // Return both loading states, the chat data, and the assistant configuration
  return {
    currentChat,
    assistantConfig,
    isLoading: isLoadingChat || isLoadingAssistant,
  };
}
export default useThreadAndAssistant;