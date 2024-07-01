import { Avatar,Card,Tooltip,Space} from 'antd';
import Ernie from '../assets/renie-bot.png'
import Qwen from '../assets/qwen-bot.png'
import LlmUnknown from '../assets/llm_unknown.png'
import Glm from '../assets/glm-bot.png'
import { TYPE_NAME } from "../constants.ts";

const { Meta } = Card;
import { useState } from 'react';
import { useEffect } from 'react';
import { getAssistant } from "../api/assistants.ts";
import { useQuery } from "react-query";
import { DeleteOutlined,PlusOutlined,InfoCircleOutlined,CheckOutlined } from '@ant-design/icons';

import {Config} from "../hooks/useConfigList";

import useChatRolAuth from "../hooks/useChatRolAuth";

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



function AsisstantCard(props: {
    config: Config;
    currentConfig: Config | null|undefined;
    enterConfig: (id: string | null) => void;
    deleteConfig: (id: string) => void;
  }) {
    

    const init_chat_data = {

        assistant_id: props.config.assistant_id,
        name: props.config.name,
        updated_at: props.config.updated_at,
        assistant_name:'未知',
        assistant_type: '未知',
        llm_icon: LlmUnknown,

    }
   
    const {assistantConfig,isLoading} = GetAssistantCfg(props.config.assistant_id as string);
    
    const [chatData,setChatData] = useState(init_chat_data);

    const extraContent = props.config.assistant_id === props.currentConfig?.assistant_id ? (
      <><CheckOutlined/></>
    ) : (
      <><InfoCircleOutlined/></>
    );

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
            agent_type_name="智谱清言"
        }else if (agent_type_name ==='通义千问(qwen-turbo)'){
            llmIcon = Qwen;
            agent_type_name = '通义千问'
        }else{
            console.log("获取Icon失败 ->:",agent_type_name);
        }


        setChatData({

            assistant_id: props.config.assistant_id,
            name: props.config.name,
            updated_at: props.config.updated_at,
            assistant_name:agent_type_name,
            assistant_type: assistant_type || '未知' ,
            llm_icon: llmIcon,
    
        })

      }, [assistantConfig]);


    return (
        <>
        <Space.Compact >
        <Tooltip placement="right" title={'点击 + 创建【'+chatData.name+'】的对话, Del 删除所有跟该助手相关对话'}>  
        <Card  extra={extraContent} style={{display: 'flex'}} loading={isLoading} hoverable size='small' actions={[
            <DeleteOutlined key="delete" onClick={() => props.deleteConfig(props.config.assistant_id)} />,
            
            <PlusOutlined key="talk" onClick={() => props.enterConfig(props.config.assistant_id)}/>,
    ]}>
    
            <Meta
              avatar={<Avatar src={chatData.llm_icon} />}
        
              title={chatData.assistant_name }
              description={chatData.assistant_type}
            />
          </Card>
        </Tooltip>
        </Space.Compact>
        </>

      );
}

export default AsisstantCard;