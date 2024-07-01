import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
} from 'antd';

import{ useState } from 'react';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

function ChatRolUserRegister() {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // 新增loading状态

  const [messageApi, contextHolder] = message.useMessage();

  const success = () => {
    messageApi.open({
      type: 'success',
      content: '注册成功！',
    });
  };

  const show_error = () => {
    messageApi.open({
      type: 'error',
      content: '抱歉！注册失败了~',
    });
  };

  const show_duname = () => {
    messageApi.open({
      type: 'warning',
      content: '抱歉，该用户名已经存在~',
    });
  };

  const show_duemail = () => {
    messageApi.open({
      type: 'warning',
      content: '抱歉，该邮箱已经存在~',
    });
  };

  interface RegValues {
    username:string;
    password: string;
    email: string;
  }

  const onFinish = async (values:RegValues) => {  
    console.log('Received values of form: ', values);  
    setLoading(true); // 开始提交时设置loading为true  
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
        success(); 
        setLoading(false);
    } else if(data.status === -2){
        show_duname();
        setLoading(false);
    } else if(data.status === -3){
        show_duemail();
        setLoading(false);
    }
    else {  
        console.error('注册失败:', data.msg);  
        show_error();
        setLoading(false);
    }  
    } catch (error) {  
    console.error('请求异常:', error);  
    show_error();
    setLoading(false); 
    }  
};  

  return (
    <>
    {contextHolder}
        <Form
      {...formItemLayout}
      form={form}
      name="register"
      onFinish={onFinish}

      style={{ maxWidth: 600 }}
      scrollToFirstError
    >
      <Form.Item
        name="email"
        label="电子邮箱"
        rules={[
          {
            type: 'email',
            message: '输入的电子邮箱格式不正确!',
          },
          {
            required: true,
            message: '请输入电子邮箱!',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[
          {
            required: true,
            message: '请输入密码',
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="确认密码"
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
              return Promise.reject(new Error('输入的用户名不匹配'));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="username"
        label="用户名"
        tooltip="别人可以看到的你的名称"
        rules={[{ required: true, message: '输入用户名', whitespace: true }]}
      >
        <Input />
      </Form.Item>


      <Form.Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement')),
          },
        ]}
        {...tailFormItemLayout}
      >
        <Checkbox>
          我同意 <a href="">协议</a>
        </Checkbox>
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit" disabled={loading} loading={loading}>
          注册
        </Button>
      </Form.Item>
    </Form>
    </>

  );
}

export default ChatRolUserRegister;