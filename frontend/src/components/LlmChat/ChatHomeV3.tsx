
import { useRef, useState,useEffect } from "react";
import { MessageWithFiles } from "../../utils/ChatItems";
import { fetchEventSource } from '@microsoft/fetch-event-source';
import {ChatV3} from "./ChatV3";
import '../../styles/tailwindStyle.css'


function ChatHomeV3() {
    const [messages, setMessages] = useState<MessageWithFiles[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // V2
    const [controller, setController] = useState<AbortController | null>(null);
  

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    // V2
    const handleCancle = () => {
        if (controller) {
          controller.abort();
          setController(null);
        }
    }
  
    // V3
    const handleSend = async (message: MessageWithFiles) => {

      // 检查有没有文件
      if (message.files && message.files?.length > 0) {  

        try{
        const formData = message.files?.reduce((formData, file) => {  
          formData.append("files", file);  
          return formData;  
        }, new FormData());  

        const content = message.content
          
        formData.append(  
          "config",  
          JSON.stringify({ configurable: { content } }),  
        );  
          
        await fetch(`/ingest`, {  
          method: "POST",  
          body: formData,  
        }); 
      }catch(e){
        alert('文件上传失败~')
      }
      }

      const updatedMessages = [...messages, message];
 
      let isFirst = true;
  
      setMessages(updatedMessages);
      setLoading(true);
  
      const ctrler = new AbortController();
      setController(ctrler);

      await fetchEventSource('/runs/stream/msg', {
        signal: ctrler.signal,
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'data': message.content,
        }),
        onmessage: (event) => {
        

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
          setController(null);
        },
        onclose: () => {
  
          console.log('EventSource closed');
          setLoading(false);
          setController(null);
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

    useEffect(() => {
        console.log('loading 状态', loading)
      }, [messages]);
  
  
    return (
      <>
  
        <div className="flex flex-col h-screen">
  
          <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
            <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
              <ChatV3
                messages={messages}
                loading={loading}
                onSend={handleSend}
                onReset={handleReset}
                onCancle={handleCancle}
              />
              <div ref={messagesEndRef} />
            </div>
          </div>

        </div>
      </>
    );
  }

  export default ChatHomeV3;