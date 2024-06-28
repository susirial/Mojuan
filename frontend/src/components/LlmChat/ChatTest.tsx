import '../../styles/tailwindStyle.css'
import {Chat} from './Chat'
import { useState } from 'react'
import { Message } from "../../utils/ChatItems";
import {ChatLoader} from './ChatLoader'


function ChatTest() {
    
    const [messages, setMessages] = useState<Message[]>([
        {role: 'user', content: '你好，今天的新闻是什么？'},
        {role: 'assistant', content: '你好，今天的新闻是关于...。'},])

    function  sendData(msg:Message){
        setMessages((prev)=>[...prev, msg])
        const aiMsg = {role: 'assistant', content: '模拟Ai 返回...'}
        setMessages((prev)=>[...prev, aiMsg as Message])
    }

    function resetScreen(){
        setMessages([])
    }
    
    return (

    <div className="flex flex-col h-screen">
        <Chat
                messages={messages}
                loading={false}
                onSend={sendData}
                onReset={resetScreen}
              />  

        <div>
        <ChatLoader/>
        </div>      
    </div>

    
)

    }

export default ChatTest