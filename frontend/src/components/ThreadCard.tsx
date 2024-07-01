import { Button,Tag} from 'antd';
import Ernie from '../assets/renie-bot.png'
import Qwen from '../assets/qwen-bot.png'
import LlmUnknown from '../assets/llm_unknown.png'
import Glm from '../assets/glm-bot.png'
import { TYPE_NAME } from "../constants.ts";


import { useState } from 'react';
import { useEffect } from 'react';
import { getAssistant } from "../api/assistants.ts";
import { useQuery } from "react-query";
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import useChatRolAuth from "../hooks/useChatRolAuth.tsx";

// 获取助手详细配置
function GetAssistantCfg(assistant_id:string) {

    const { authToken} = useChatRolAuth();

    // React Query to fetch assistant configuration based on the assistant_id
    const { data: assistantConfig, isLoading: isLoadingAssistant } = useQuery(
      ["assistant", assistant_id],
      () => getAssistant(assistant_id as string,authToken),
      {
        enabled: !!assistant_id,
      },
    );
  
    // Return both loading states, the chat data, and the assistant configuration
    return {
      assistantConfig,
      isLoading:  isLoadingAssistant,
    };
  }



function ThreadCard(props:{
    chat: {
      // user_id: string;
      assistant_id: string;
      thread_id: string;
      name: string;
      updated_at: string;
    },
    deleteChat: (id: string) => void,
}) {
    
    const navigate = useNavigate();
    const init_chat_data = {
        thread_id: props.chat.thread_id,
        // user_id: props.chat.user_id,
        assistant_id: props.chat.assistant_id,
        name: props.chat.name,
        updated_at: props.chat.updated_at,
        assistant_name:'未知',
        assistant_type: '未知',
        llm_icon: LlmUnknown,

    }
    const {assistantConfig,isLoading} = GetAssistantCfg(props.chat.assistant_id as string);
    
    const [chatData,setChatData] = useState(init_chat_data);


    useEffect(() => {

        let configurable = null;

        // 助手名称
        let agent_type_name = 'unknown';

        // 助手类型
        let assistant_type = '未知';

        //助手Icon
        let llmIcon = LlmUnknown;

        if (assistantConfig) {
          configurable = assistantConfig.config?.configurable;
        }
        // 助手类型
        const agent_type = configurable?.["type"] as TYPE_NAME | null;

        if (agent_type === null) {
            console.log("Error: agent_type is null");
        } else if(agent_type === "chatbot"){
            assistant_type = "chatbot"
            agent_type_name = (configurable?.["type==chatbot/llm_type"] as string) ;
        }else if (agent_type === "agent") {
            assistant_type = "智能体"
            agent_type_name = (configurable?.["type==agent/agent_type"] as string) ;
        }else if (agent_type === "chat_retrieval"){
            assistant_type = "RAG"
            agent_type_name = (configurable?.["type==chat_retrieval/llm_type"] as string) ;
        }else{
            assistant_type = "未知";
            agent_type_name = " 未知";
        }

        //判断llm厂商图形
        if (agent_type_name ==='ERNIE-Speed-128K'){
            llmIcon = Ernie;
            agent_type_name="文心一言"
        }else if (agent_type_name ==='智谱清言GLM4'){
            llmIcon = Glm;
            agent_type_name = "智谱清言"
        }else if (agent_type_name ==='通义千问(qwen-turbo)'){
            llmIcon = Qwen;
            agent_type_name="通义千问"
        }else{
            console.log("获取Icon失败 ->:",agent_type_name);
        }

        setChatData({
            // user_id: props.chat.user_id,
            thread_id: props.chat.thread_id,
            assistant_id: props.chat.assistant_id,
            name: props.chat.name,
            updated_at: props.chat.updated_at.replace('T', ' ').slice(0,19),
            assistant_name:agent_type_name,
            assistant_type: assistant_type || '未知' ,
            llm_icon: llmIcon,
    
        })

      }, [assistantConfig]);

    if (isLoading){
        return( <div> 载入中...</div>)
    }

    return(
        <>
      
        <Tag onClick={()=>{
      navigate(`/thread/${chatData.thread_id}`);
        }}
        
        style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '10px',
            padding: '5px',
            margin: '5px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',}}
        >
        <span>{chatData.name.slice(0,4)}</span>
        <span>{chatData.updated_at}</span>

        <Button type="text" size="small" danger style={{marginLeft: '10px'}} icon={<DeleteOutlined/>} onClick={()=>{
            props.deleteChat(chatData.thread_id);
        }}></Button>
        </Tag>
   
        </>
    )
}

export default ThreadCard;