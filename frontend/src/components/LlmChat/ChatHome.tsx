
import { useRef, useState,useEffect } from "react";
import { Message } from "../../utils/ChatItems";
import { fetchEventSource } from '@microsoft/fetch-event-source';
import {Chat} from "./Chat";
import '../../styles/tailwindStyle.css'


function ChatHome() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
  

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
  
    const handleSend = async (message: Message) => {
      const updatedMessages = [...messages, message];
  
      let isFirst = true;
  
      setMessages(updatedMessages);
      setLoading(true);
  
      const controller = new AbortController();
      await fetchEventSource('/msgstream', {
        signal: controller.signal,
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'data': message.content,
        }),
        onmessage: (event) => {
        
        console.log('消息列表',messages);
        if (isFirst) {
          isFirst = false;
          setMessages((messages) => [  
            ...messages,  
            {'role':'assistant','content': event.data},  
        ]); 
        }else{
          setMessages((messages) => [  
            ...messages.slice(0, -1),  
            {'role':'assistant','content': messages[messages.length - 1]?.content + event.data},  
        ]);
        }
  
    },  
        onerror: (error) => {
          setLoading(false);
          alert('对话出错')
          console.error('EventSource error:', error);
        },
        onclose: () => {
  
          //alert('关闭')
    
          console.log('EventSource closed');
          setLoading(false);
        }
      })
  
  
      setLoading(false);
    };
  
    const handleReset = () => {
      setMessages([
      ]);
    };
  
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
  
  
    return (
      <>
  
        <div className="flex flex-col h-screen">
  
          <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
            <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
              <Chat
                messages={messages}
                loading={loading}
                onSend={handleSend}
                onReset={handleReset}
              />
              <div ref={messagesEndRef} />
            </div>
          </div>

        </div>
      </>
    );
  }

  export default ChatHome;