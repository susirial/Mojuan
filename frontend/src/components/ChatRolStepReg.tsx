// 导入React和所需的组件  
import { useState,useEffect } from 'react';  
import { useNavigate } from "react-router-dom";
import { StepsForm, ProFormText, ProFormCaptcha } from '@ant-design/pro-components';  
import useChatRolSendEmail from '../hooks/useChatRolSendEmail';
import ReactSliderVerify from "react-slider-verify";
import "react-slider-verify/dist/index.css";
import { Form } from 'antd';  
  
const ChatRolStepReg = () => {  
const [email, setEmail] = useState('');  
const [disableLogin, setDisableLogin] = useState(true);


const navigate = useNavigate();
// const [form] = StepsForm.useForm();  
// 邮箱验证码状态
const { loading, errorMsg,handleEmailChange } = useChatRolSendEmail(email);

// 添加用户名和密码
const [useInfoUploading, setUseInfoUploading] = useState(false);

  // 定义一个状态来追踪是否已发送验证码请求  
const [isSendingCode, setIsSendingCode] = useState(false);  


// 定义发送用户名和密码的 最终处理函数

interface StepRegData {
  username: string;
  password: string;
  email: string;
}

const handleFinish = async (values:StepRegData) => {  
  console.log('Received values of form: ', values);  
  setUseInfoUploading(true); // 开始提交时设置loading为true  
  try {  
      const response = await fetch('/register', {  
      method: 'POST',  
      headers: {  
      'Content-Type': 'application/json',  
      },  
      body: JSON.stringify({  
      username: values.username, 
      password: values.password,
      email: values.email
      }),  
  });  

  const data = await response.json(); 
      
  if (data.status === 0) {    
      alert('注册成功！');
      setUseInfoUploading(false);
      navigate('/');
  } else if(data.status === -1){
      alert('用户名已存在！');
      setUseInfoUploading(false);
  } else if(data.status === -2){
      alert('邮箱已存在！');
      setUseInfoUploading(false);
  }
  else {  
      console.error('注册失败:', data.msg);  
      alert('抱歉，注册失败~');
      setUseInfoUploading(false);
  }  
  } catch (error) {  
  console.error('请求异常:', error);  
  alert('抱歉，请求异常~');
  setUseInfoUploading(false); 
  }  
}; 

useEffect(() => {  
    // 如果不是在发送验证码的状态，不执行任何操作  
    if (!isSendingCode) return;  
    
    // 如果处于加载状态，显示加载信息  
    if (loading) {  
      console.log('邮箱验证码发送中...');
    } else {  
      // 根据是否有错误来显示不同的信息  
      if (errorMsg) {  
        // message.error(errorMsg);  
        alert('发送验证码失败: ' + errorMsg);
        console.log('进入父组件的useEffect: ',errorMsg);
      } else {  
        // message.success(`验证码已发送至 ${email}`);  
        alert('验证码已发送至 ' + email);
        console.log('进入父组件的useEffect: 验证码已发送至 ：',email);
      }  
        // 当不再加载时（即已经加载完成），重置发送状态  
        setIsSendingCode(false);  
    }  
  }, [errorMsg,loading]); // 依赖项列表中包含了 loading, error 和 isSendingCode  

  
  // 发送邮箱验证码
  const sendVerificationCode = async () => {  
    // 这里应该调用后端API发送验证码  
    if (email) { // 确保邮箱已经通过前端验证  
        setIsSendingCode(true);  
        handleEmailChange(email); 
      // 发送验证码逻辑  
    }  
  };  
   
  
  if (useInfoUploading){
    return <div>注册中...</div>;
  }

  return (  
    <>
    <div>
    <StepsForm 
    //   form={form}  
      onFinish={handleFinish}  
    >  
      <StepsForm.StepForm  
        disabled={disableLogin}
        title="填写邮箱"  

        // 处理用户邮箱验证码
        onFinish={async (values) => {  
            // 从表单数据中获取 email 和验证码  
            const{email,captcha} = values;
            try {  
              // 发送请求到后端  
              const response = await fetch('/vemail/code', {  
                method: 'POST',  
                headers: {  
                  'Content-Type': 'application/json',  
                },  
                body: JSON.stringify({  
                  email: email,  
                  code: captcha,  
                }),  
              });  
             
            
              // 根据后端返回的状态处理结果  
              if (response.ok) {  
                // 如果响应状态码是200-299，处理成功的情况  
                // message.success(data.msg); 
                              // 将响应转换为JSON  
                const data = await response.json(); 
                console.log(data);
                alert('邮箱验证成功');
                return true; // 表单处理成功，可以进行下一步或重置表单  
              } else {  
                // 如果响应状态码不在200-299范围内，处理错误情况  
    
                if (response.status === 400){
                    alert('验证码错误，请重试。');
                }else if(response.status === 410){
                    alert('验证码过期，请重试。');
                }else{
                    alert('验证失败，请重试。');
                }
                
                return false; // 阻止表单处理，不进行下一步  
              }  
            } catch (error) {  
              // 处理网络错误或请求发送失败的情况  
              alert('网络错误或服务器无法处理请求。') 
              return false; // 阻止表单处理  
            }  
          }}   
      >  
        <ProFormText  
          name="email"  
          label="邮箱"  
          fieldProps={{  
            size: 'large',  
            prefix: '',  
            onChange: (e) => setEmail(e.target.value),
          }}  
          placeholder="请输入邮箱"  
          rules={[  
            { required: true, message: '请输入邮箱' },  
            { type: 'email', message: '请输入正确的邮箱格式' }  
          ]}  
   
        />  
        <ProFormCaptcha  
          fieldProps={{  
            size: 'large',  
          }}  
          captchaProps={{  
            size: 'large',  
          }}  
          phoneName="email"  
          name="captcha"  
          rules={[  
            {  
              required: true,  
              message: '请输入验证码',  
            },  
          ]}  
          placeholder="请输入验证码"  
          onGetCaptcha={sendVerificationCode}  
        />  
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
      </StepsForm.StepForm>  
      <StepsForm.StepForm  
        title="设置用户名和密码" 
        onFinish={async () => {  
          
            console.log('');
          }} 
      >  
        <ProFormText  
          name="username"  
          label="用户名"  
          placeholder="请输入用户名"  
          rules={[  
            {  
              required: true,  
              message: '请输入用户名',  
            },  
          ]}  
        />  
        <ProFormText.Password  
          name="password"  
          label="密码"  
          placeholder="请输入密码"  
          rules={[  
            {  
              required: true,  
              message: '请输入密码',  
            },  
            {  
              min: 6,  
              message: '密码至少为6位',  
            },  
          ]}  
        />  
        <ProFormText.Password  
            name="confirm"  
            label="确认密码"  
            placeholder="请再次输入密码"  
            dependencies={['password']}  
            hasFeedback  
            rules={[  
                {  
                required: true,  
                message: '请确认密码',  
                },  
                ({ getFieldValue }) => ({  
                validator(_, value) {  
                    if (!value || getFieldValue('password') === value) {  
                    return Promise.resolve();  
                    }  
                    return Promise.reject(new Error('两次输入的密码不匹配!'));  
                },  
                }),  
            ]}  
            /> 
        
      </StepsForm.StepForm>
    </StepsForm>
    </div>
    <div>
    </div>

    </>

  )     

};
  export default ChatRolStepReg;
