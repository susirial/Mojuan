
import {  Divider, Layout,Row,Col, Button, Space,Typography,Avatar,Tooltip  } from 'antd';
import Logo from '../assets/logo.png'
import { PlusOutlined,InfoCircleOutlined } from '@ant-design/icons';
import ThreadList from './ThreadList';
import AsisstantList from './AsisstantList';
import { useNavigate } from "react-router-dom";
import useChatList from '../hooks/useChatList';
import useConfigList from '../hooks/useConfigList';
import useStreamState from '../hooks/useStreamState';
import useSchemas from '../hooks/useSchemas';
import useThreadAndAssistant from '../hooks/useThreadAndAssistant';
import { useCallback, useState } from "react";
import { MessageWithFiles } from "../utils/formTypes.ts";
import {ChatRolAsisstantCfg} from '../components/ChatRolAsisstantCfg';
import  '../../gpts.css';

import {
  Config as ConfigInterface,
} from "../hooks/useConfigList";
import { Chat } from "../components/Chat";
import { ChatRolNewChat } from "../components/ChatRolNewChat";
import ChatRolUserCard from "../components/ChatRolUserCard";



const { Text,Title,Link  } = Typography;

const deleteConfig: (assistantId: string) => Promise<void> = async (assistantId:string) => {  
  console.log("deleteConfig:",assistantId);
  // Intentionally empty  
};  


function Home(props: { edit?: boolean })  {
  const navigate = useNavigate();
  const { createChat } = useChatList();
  const { configs, saveConfig } = useConfigList();
  const { startStream, stopStream, stream } = useStreamState();
  const { configSchema, configDefaults } = useSchemas();
  const { currentChat, assistantConfig } = useThreadAndAssistant();
  const navigator = useNavigate();
  const [msgLoop, setMsgLoop] = useState<boolean>(true);



  const startTurn = useCallback(
    async (message: MessageWithFiles | null, thread_id: string) => {
    
      const files = message?.files || [];
      if (files.length > 0) {
        const formData = files.reduce((formData, file) => {
          formData.append("files", file);
          return formData;
        }, new FormData());
        formData.append(
          "config",
          JSON.stringify({ configurable: { thread_id } }),
        );
        await fetch(`/ingest`, {
          method: "POST",
          body: formData,
        });
      }
      await startStream(
        message
          ? [
              {
                content: message.message,
                additional_kwargs: {},
                type: "human",
                example: false,
                id: `human-${Math.random()}`,
              },
            ]
          : null,
        thread_id,
      );
    },
    [startStream],
  );


  const startChat = useCallback(
    async (config: ConfigInterface, message: MessageWithFiles) => {
      const chat = await createChat(message.message, config.assistant_id);
      navigate(`/thread/${chat.thread_id}`);
      return startTurn(message, chat.thread_id);
    },
    [createChat, navigate, startTurn],
  );

  const selectConfig = useCallback(
    (id: string | null) => {
      // 跳转 相应的助手，或者创建助手
      navigate(id ? `/assistant/${id}` : "/cfg");
    },
    [navigate],
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>

      <Row>
        
        <Col span={3} style={{ display: 'flex', flexDirection: 'column' }} flex={1}>
        <div style={{ flex: 1 }}>
        <Space  align="start" direction="horizontal" style={{ padding: '10px' }}>
          <Avatar src={Logo} size={'large'} shape='square'/>
          <Title level={2} style={{ marginLeft: '10px' }}>茉卷</Title>
        </Space>
       
        <Button type='text' icon={<PlusOutlined />} ghost block onClick={() => selectConfig(null)}>新建助手</Button>
        <Divider type='horizontal' > 助手列表</Divider>
        
        <AsisstantList currentConfig={assistantConfig} enterConfig={(id) => navigator(`/assistant/${id}`)}/>

        </div> {/* 占位元素，使内容可以推到最下面 */}

        <ChatRolUserCard/>



        </Col>

        <Divider type='vertical' style={{height: '100vh'}}></Divider>

        <Col span={3} style={{ display: 'flex', flexDirection: 'column' }} flex={1}>
        <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'top' }}>
        <Space.Compact style={{ width: '100%' }}>
     
        <Button type='text' ghost block> 对话历史 </Button>
        </Space.Compact>
  
        </div>

        <ThreadList updateChatList={()=>navigate('/')} />

        </div> {/* 占位元素，使内容可以推到最下面 */}
   
        </Col>

        <Divider type='vertical' style={{height: '100vh'}}></Divider>

        <Col span={12} style={{ display: 'flex', flexDirection: 'column' }} flex={1}>

        <div style={{ flex: 1 }}>
          <Tooltip placement="bottom" title={'茉卷站内提示，点击可关闭'}>
        <Button type='text' onClick={() => setMsgLoop(!msgLoop)} block icon={<InfoCircleOutlined/>}>今日提示</Button>
        </Tooltip>
        <div hidden={msgLoop}>
          哈喽啊~ 欢迎访问茉卷~
          我能够回答您的问题，提供有用的信息和帮助。
          如果您有任何问题或需要帮助，请随时问我。
        </div>


        <div >
        {currentChat && assistantConfig && (
        <Chat startStream={startTurn} stopStream={stopStream} stream={stream} />
      )}
      {!currentChat && assistantConfig && !props.edit && (
        <ChatRolNewChat
          startChat={startChat}
          configSchema={configSchema}
          configDefaults={configDefaults}
          configs={configs}
          saveConfig={saveConfig}
          enterConfig={selectConfig}
          deleteConfig= {deleteConfig}
        />
      )}

      { props.edit && (
        <ChatRolAsisstantCfg
        startChat={startChat}
        configSchema={configSchema}
        configDefaults={configDefaults}
        configs={configs}
        saveConfig={saveConfig}
        enterConfig={selectConfig}
        deleteConfig= {deleteConfig}
        />
      )}

    

        </div>

        </div> {/* 占位元素，使内容可以推到最下面 */}

        <Row >
        <Space.Compact style={{ width: '100%' }}>
        <Text type="secondary" >以上内容仅供参考 ©2024 </Text>
        <Text type="secondary" >|</Text>
        <Link  href='#' target='_blank' > 用户协议
        </Link>
        </Space.Compact>
        </Row>

        
        
        </Col>
        <Col span={4}>

        {/* <Button type='text' block>即将到来~</Button> */}
        </Col>
      </Row>


    </Layout>
  );
}

export default Home;