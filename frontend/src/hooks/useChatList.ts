import { useCallback, useEffect, useReducer } from 'react';  
import orderBy from 'lodash/orderBy';  
import useChatRolAuth from './useChatRolAuth';
import { useNavigate } from 'react-router-dom';
  
// ... Message and Chat interfaces ...  
export interface Message {
  id: string;
  type: string;
  content:
    | string
    | { page_content: string; metadata: Record<string, object> }[]
    | object;
  name?: string;
  additional_kwargs?: {
    name?: string;
    function_call?: {
      name?: string;
      arguments?: string;
    };
    tool_calls?: {
      id: string;
      function?: {
        name?: string;
        arguments?: string;
      };
    }[];
  };
  example: boolean;
}

export interface Chat {
  assistant_id: string;
  thread_id: string;
  name: string;
  updated_at: string;
}

export interface ChatListProps {
  chats: Chat[] | null;
  createChat: (
    name: string,
    assistant_id: string,
    thread_id?: string,
  ) => Promise<Chat>;
    deleteChat: (thread_id: string) => void;
}
  
// Define action types  
const ActionTypes = {  
  SET_CHATS: 'SET_CHATS',  
  DELETE_CHAT: 'DELETE_CHAT',  
  ADD_OR_UPDATE_CHAT: 'ADD_OR_UPDATE_CHAT',  
};  
  
// ... Action type definition ...  
type Action =
  | { type: typeof ActionTypes.SET_CHATS; payload: Chat[] }
  | { type: typeof ActionTypes.DELETE_CHAT; payload: string }
  | { type: typeof ActionTypes.ADD_OR_UPDATE_CHAT; payload: Chat };

  
function chatsReducer(state: Chat[] | null, action: Action): Chat[] | null {  
  switch (action.type) {  
    case ActionTypes.SET_CHATS:  
      return orderBy(action.payload as Chat[], 'updated_at', 'desc');  
 
    case ActionTypes.ADD_OR_UPDATE_CHAT: {  
      // Create a new block scope for the case  
      const updatedChats = state ? state.filter(c => c.thread_id !== (action.payload as Chat).thread_id) : [];  
      updatedChats.push(action.payload as Chat);  
      return orderBy(updatedChats, 'updated_at', 'desc');  
    }  
    case ActionTypes.DELETE_CHAT:  
      return state ? state.filter(chat => chat.thread_id !== action.payload) : null;  
    default:  
      return state;  
  }  
}  
  
  
function useChatList(): ChatListProps {  
  const [chats, dispatch] = useReducer(chatsReducer, null);  
  const { authToken} = useChatRolAuth();
  const navigate = useNavigate();
  
  // Fetch chats on component mount  
  useEffect(() => {  
    let isMounted = true;  
  
    async function fetchChats() {  
      try {  
        const response = await fetch('/threads/', {  
          headers: {  
            Accept: 'application/json',  
            'Authorization': `Bearer ${authToken}`,
          },  
        });  
        if (isMounted && response.ok) {  
          const chats = await response.json();  
          dispatch({ type: ActionTypes.SET_CHATS, payload: chats });  
        } else if (!response.ok) {  

          if (response.status === 402 || response.status === 401 || response.status === 422) {
            console.log(' useChatList triggered')
            navigate('/signin',{ state: { from: '/' } })
          }else{
            navigate(`/500/${response.status}`)
          }

          throw new Error(`HTTP error! status: ${response.status}`);  
        }  
      } catch (error) {  
        // Handle fetch error  
        console.error('Failed to fetch chats:', error);  
      }  
    }  
  
    fetchChats();  
  
    return () => {  
      isMounted = false;  
    };  
  }, []);  
  
  // Function to create a chat  
  const createChat = useCallback(async (name: string, assistant_id: string, thread_id?: string) => {  
    try {  
      const response = await fetch('/threads', {  
        method: 'POST',  
        body: JSON.stringify({ assistant_id, name, thread_id }),  
        headers: {  
          'Content-Type': 'application/json',  
          Accept: 'application/json',  
          'Authorization': `Bearer ${authToken}`,
        },  
      });  
      if (response.ok) {  
        const savedChat = await response.json();  
        dispatch({ type: ActionTypes.ADD_OR_UPDATE_CHAT, payload: savedChat });  
        return savedChat;  
      } else {  
        throw new Error(`HTTP error! status: ${response.status}`);  
      }  
    } catch (error) {  
      // Handle create error  
      console.error('Failed to create chat:', error);  
      throw error;  
    }  
  }, []);  
  
  // Function to delete a chat  
  const deleteChat = useCallback(async (thread_id: string) => {  
    try {  
      const response = await fetch(`/threads/delete`, {  
        method: 'POST',  
        body: JSON.stringify({ thread_id }),  
        headers: {  
          'Content-Type': 'application/json',  
          Accept: 'application/json',  
          'Authorization': `Bearer ${authToken}`,
        },  
      });  
  
      if (response.ok) {  
        dispatch({ type: ActionTypes.DELETE_CHAT, payload: thread_id });  
      } else {  
        throw new Error(`HTTP error! status: ${response.status}`);  
      }  
    } catch (error) {  
      // Handle delete error  
      console.error('Failed to delete chat:', error);  
      throw error;  
    }  
  }, []);  
  
  return {  
    chats,  
    createChat,  
    deleteChat,  
  };  
}  
  
export default useChatList;  
