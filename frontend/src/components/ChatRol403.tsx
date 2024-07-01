import { useNavigate } from 'react-router-dom';  
import { Button, Result } from 'antd';  
  
function ChatRol403() {  
  const navigate = useNavigate(); 
   
  const handleGoHome = () => {  
    console.log('handleGoHome triggerd');
    navigate('/'); 
  };  
  
  return (  
    <Result  
      status="403"  
      title="403"  
      subTitle="抱歉，您没有权限访问该页面~。~"  
      extra={  
        <Button type="primary" onClick={handleGoHome}>返回主页</Button> // 
      }  
    />  
  );  
}  
  
export default ChatRol403;  
