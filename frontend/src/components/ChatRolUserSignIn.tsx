import { LoginForm, ProFormText } from '@ant-design/pro-components';  
import {  
  LockOutlined,  
  UserOutlined,  
} from '@ant-design/icons';  
import { Form, message,Button,Typography } from 'antd';  
import { useState, useEffect } from 'react';  
// import {  authToken, login, logout } from '../hooks/useChatRolAuth';
import useChatRolAuth  from  '../hooks/useChatRolAuth' // 确保路径正确  
import { useNavigate,useLocation } from 'react-router-dom'; 

import {SignatureOutlined,KeyOutlined} from '@ant-design/icons';
const { Link  } = Typography;
import ReactSliderVerify from "react-slider-verify";
import "react-slider-verify/dist/index.css";

  
function ChatRolUserSign() {  
  const [form] = Form.useForm();  
  const [loading, setLoading] = useState(false);  
  const [submitStatus, setSubmitStatus] = useState('init');  
  // const [messageApi, contextHolder] = message.useMessage();  
  const { login } = useChatRolAuth(); // 使用解构来获取 login 函数
  const [disableLogin, setDisableLogin] = useState(true);

  const navigate = useNavigate(); 
  const location = useLocation(); 

  const { from } = location.state || { from: { pathname: '/' } }; 
  
  useEffect(() => {  
    // 根据提交状态显示消息  
    if (submitStatus === 'success') {  
      message.success('登录成功！'); 
      navigate(from); // 导航到之前访问的页面
    } else if (submitStatus === 'miss_match_error') {  
      message.error('用户名|密码不匹配~');  
    } else if (submitStatus === 'unknow_user') {  
      message.error('用户不存在~');  
    } else if (submitStatus === 'other_err') {  
      message.error('登录出错~');  
    }  
  
    // 重置提交状态  
    if (submitStatus) {  
      setSubmitStatus('init');  
    }  
  
  }, [submitStatus]);  

  interface LoginValues {
    email: string;
    password: string;
  }
  
  const onFinish = async (values:LoginValues) => {  
    setLoading(true);  
  
    try {  
      const response = await fetch('/login', {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
        },  
        body: JSON.stringify({  
          email: values.email,  
          password: values.password,  
        }),  
      });  
  
      const data = await response.json();  
  
      if (data.status === 0) {  
        setSubmitStatus('success');  
        login(data.token);
      } else if (data.status === -2) {  
        setSubmitStatus('unknow_user');  
      } else {  
        setSubmitStatus('miss_match_error');  
      }  
    } catch (error) {  
      setSubmitStatus('other_err');  
    } finally {  
      setLoading(false);  
    }  
  };  
  
 if (loading){
    return <div>载入中...</div>;
 }

  return (  
    <>   
  <div>
    <div>
    <LoginForm   disabled={disableLogin}
        title="茉卷"  
        subTitle="工作很辛苦，为什么要卷？-莫卷"  
        form={form}  
        onFinish={onFinish}  
      >  
        <ProFormText  
          name="email"  
          fieldProps={{  
            size: 'large',  
            prefix: <UserOutlined className={'prefixIcon'} />,  
          }}  
          placeholder={'您的邮箱: '}  
          rules={[  
            {  
              type: 'email',
              required: true,  
              message: '请输入您的注册邮箱',  
            },  
          ]}  
        />  
        <ProFormText.Password  
          name="password"  
          fieldProps={{  
            size: 'large',  
            prefix: <LockOutlined className={'prefixIcon'} />,  
          }}  
          placeholder={'输入您的登录密码'}  
          rules={[  
            {  
              required: true,  
              message: '请输入密码！',  
            },  
          ]}  
        />

    <div style={{marginBlockEnd: 24}}>

            <Button type="text" size='small' icon={<SignatureOutlined />} onClick={()=>{navigate('/signup')}}>注册</Button>
            <Link  href='/agreement' target='_blank' >用户协议</Link>
            <Button type="text" size='small' icon={<KeyOutlined />} style={{
                float: 'right',
              }} onClick={()=>{navigate('/resetpwd')}}>忘记密码</Button>
           
    </div>
      <Form.Item
          label=""
          name="sliderVerify"
          rules={[
            {
              required: true,
              message: "向右滑动以解锁",
            },
          ]}
        >
          <ReactSliderVerify tips={'👈向右滑动以解锁'} width={268} height={32} barWidth={50} onSuccess={() => {setDisableLogin(false)}} successTips={'验证成功'} />
        </Form.Item>
      </LoginForm> 
    </div>
   
  </div>
      
    </>  
  );  
}  
  
export default ChatRolUserSign;  
