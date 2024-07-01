import { useState } from 'react';  
import useChatRolAuth from './useChatRolAuth';
import {useNavigate} from 'react-router-dom';
  

export interface UserData {
  username:string;
  user_email:string ;
  doc_visit_days:number;
  last_login:string;
  user_id: string;
  user_mask: number ;
  user_group: string;
  user_status: string;
  hl_llm_visit_days: number;
}

const useChatRolGetCurUser = () => {  
  const [getUserLoading, setGetUserLoading] = useState(false);  
  const [userData, setUserData] = useState<UserData | null>(null);  
  const { authToken} = useChatRolAuth(); // 使用解构来获取 login 函数
  const [getUserErrors, setGetUserErrors] = useState('');
  const navigate = useNavigate();
  
  const fetchCurrentUser = async () => {  
    setGetUserLoading(true);  
    try {  
      const response = await fetch('/listusers/current/user', {  
        method: 'GET',  
        headers: {
          Accept: 'application/json',
          'Authorization': `Bearer ${authToken}`,
          },
      }); 
      const data = await response.json();  
      if(!response.ok)
        {
            // if (response.status === 402 || response.status === 401 || response.status === 422) {
            //   console.log(' useChatRolGetCurUser triggered')
            //   navigate('/signin',{ state: { from: '/' } })
            // }else{
            //   navigate(`/500/${response.status}`)
            // }
            navigate('/signin',{ state: { from: '/' } })
        }else{
            setUserData(data.user_data);
        }
      
    } catch (error) {  
        setGetUserErrors('获得用户数据失败');
        navigate('/signin',{ state: { from: '/' } });
    } finally {  
        setGetUserLoading(false);  
    }  
  };  
  
  return { getUserLoading, userData, getUserErrors,fetchCurrentUser };  
};  
  
export default useChatRolGetCurUser;  