import { useNavigate } from 'react-router-dom';  
import { Button, Result } from 'antd';  
  
function ChatRol404() {  
  const navigate = useNavigate(); 
  
 
  const handleGoHome = () => {  
    navigate('/'); 
  };  
  
  return (  
    <Result  
      status="404"  
      title="404"  
      subTitle="抱歉，您访问的页面不存在~"  
      extra={  
        <Button type="primary" onClick={handleGoHome}>返回主页</Button> 
      }  
    />  
  );  
}  
  
export default ChatRol404;  
