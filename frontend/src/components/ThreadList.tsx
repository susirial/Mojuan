import useChatList from "../hooks/useChatList";

import ThreadCard from "./ThreadCard";
import { Divider } from "antd";


function ThreadList(props:{
    updateChatList:()=>void,//更新列表
}) {
    
    const { chats,deleteChat } = useChatList();


    async function updateHomeChat(thread_id:string){
        await deleteChat(thread_id)
        props.updateChatList()

    }

    return (
        <ul role="list" className="-mx-2 mt-2 space-y-1">
        {chats?.map((chat) => (
          <li key={chat.thread_id} style={{'marginLeft':'5px'}}>
            <ThreadCard chat={chat} deleteChat={updateHomeChat}/>
          </li>
        )) ?? (
          <li className="leading-6 p-2 animate-pulse font-black text-gray-400 text-lg">
         <Divider type='horizontal'>暂无数据</Divider>
          </li>
        )}
      </ul>
    )

}

export default ThreadList;