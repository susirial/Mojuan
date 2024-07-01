import {  Button,Avatar } from 'antd';
import { UserOutlined ,LogoutOutlined } from '@ant-design/icons';
import useChatRolGetCurUser from '../hooks/useChatRolGetCurUser';
import { useEffect } from 'react';
import useChatRolAuth from '../hooks/useChatRolAuth';
import {useNavigate } from "react-router-dom";



function ChatRolUserCard() {

    const { getUserLoading, userData, getUserErrors,fetchCurrentUser } = useChatRolGetCurUser()
    const { logout} = useChatRolAuth();
    const navigate = useNavigate();
    

    useEffect(() => {
        // 获取用户数据
        fetchCurrentUser();
    },[])


    if (getUserLoading) {
        return <div>用户数据载入中...</div>;
    }

    if (getUserErrors) {
        return <div>获取用户数据失败: {getUserErrors}</div>;
    }   

    if (!userData) {
        navigate('/signin');
        return null
    }

    
    return (
        <div>
        <Avatar  shape="square" icon={<UserOutlined />} style={{ backgroundColor: '#40a9ff',padding: '10px'}} size="small">
        </Avatar>
      <Button
        size="small"
        type="text" 
        style={{  margin: '0 16px', verticalAlign: 'middle' }}
    
      >
     {userData.username.slice(0,4)}
      </Button>
      <Button size="small" style={{ verticalAlign: 'right' }}  icon={<LogoutOutlined />} onClick={() => { logout();navigate('/signin'); }}>
          退出登录
      </Button>
        </div>
    )
}

export default ChatRolUserCard;