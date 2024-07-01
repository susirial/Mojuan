import { Chat } from "../hooks/useChatList.ts";

export async function getThread(threadId: string, authToken: string): Promise<Chat | null> {  
  try {  
    const response = await fetch(`/threads/${threadId}`, {  
      method: 'GET',  
      headers: {  
        Accept: 'application/json',  
        'Authorization': `Bearer ${authToken}`,  
      },  
    });  
  
    if (response.ok) {  
      const data: Chat = await response.json();  
      return data;  
    } else {  
     
      switch (response.status) {  
        case 401: // 未认证  
        case 403: // 无权限  
          throw new Error('需要授权，请登录.');  
        case 402:  
        case 422: // 无法处理的实体  
          throw new Error('无效的参数~');  
        default:  
          throw new Error('获取数据异常！');  
      }  
    }  
  } catch (error) {   
    console.error("获取thread 异常:", error);  
    throw error;  
  }  
}  

