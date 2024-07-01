import { useState, useEffect } from 'react';


const useChatRolSendEmailForPswReset = (email: string) => {
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<Error|null>(null);
    const [mailAddr, setMailAddr] = useState(email);
    

    function handleEmailChange(newEmail: string) {
        setMailAddr(newEmail);
    }

    useEffect(() => {

        setErrorMsg(null);
        if (!mailAddr) {
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/vemail/chgpsw', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                     
                    },
                    body: JSON.stringify({ 
                        email: mailAddr
                     }),
                });
                
                if (!response.ok) {
                    if (response.status === 409) {
                        throw new Error('邮箱已经存在！');
                    }else{
                        throw new Error('发送邮件验证码请求失败');
                    }
 
                }
                // const data = await response.json();
                // 处理后端返回的数据
                
            } catch (error) {
                if (error instanceof Error) {
                    setErrorMsg(error);
                }else{
                    setErrorMsg(new Error('未知错误'));
                }
            } finally {
                setLoading(false);
            }
            
        };
        fetchData();
        
    }, [mailAddr]);
    
    return { loading, errorMsg,handleEmailChange };
                
}

export default useChatRolSendEmailForPswReset;