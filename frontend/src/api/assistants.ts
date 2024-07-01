import { Config } from "../hooks/useConfigList";

export async function getAssistant(
  assistantId: string,
  authToken: string,
): Promise<Config | null> {
  try {
    const response = await fetch(`/assistants/${assistantId}`, {  
      method: 'GET',  
      headers: {
        Accept: 'application/json',
        'Authorization': `Bearer ${authToken}`,
        },
    });
    if (!response.ok) {
      // 如果响应不成功，根据状态码抛出不同的错误  
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
    return (await response.json()) as Config;
  } catch (error) {
    console.error("Failed to fetch assistant:", error);
    throw error;  
  }
}
