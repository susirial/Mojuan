
import { useNavigate,useParams } from 'react-router-dom';  
import { Button, Result } from 'antd';  
  
function ChatRol500() {  
  const navigate = useNavigate();  
  const { errorCode } = useParams(); 
   
  const handleGoHome = () => {  
    navigate('/'); 
  };  
  
  return (  
    <Result  
      status="500"  
      title="500"  
      subTitle={'抱歉，访问出错，请联系管理员！错误码：' + errorCode}
      extra={  
        <Button type="primary" onClick={handleGoHome}>返回主页</Button> 
      }  
    />  
  );  
}  
  
export default ChatRol500;  
