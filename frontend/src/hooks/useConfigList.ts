import { useCallback, useEffect, useReducer } from "react";
import orderBy from "lodash/orderBy";
import useChatRolAuth from './useChatRolAuth';

export interface Config {
  assistant_id: string;
  name: string;
  updated_at: string;
  config: {
    configurable?: {
      tools?: string[];
      [key: string]: unknown;
    };
  };
  public: boolean;
  mine?: boolean;
}

export interface ConfigListProps {
  configs: Config[] | null;
  saveConfig: (
    key: string,
    config: Config["config"],
    files: File[],
    isPublic: boolean,
    assistantId?: string,
  ) => Promise<string>;
  deleteConfig: (assistantId: string) => Promise<void>;
}

function configsReducer(
  state: Config[] | null,
  action: Config | Config[],
): Config[] | null {
  state = state ?? [];
  if (!Array.isArray(action)) {
    const newConfig = action;
    action = [
      ...state.filter((c) => c.assistant_id !== newConfig.assistant_id),
      newConfig,
    ];
  }
  return orderBy(action, "updated_at", "desc");
}

function useConfigList(): ConfigListProps {
  const [configs, setConfigs] = useReducer(configsReducer, null);
  const { authToken} = useChatRolAuth(); // 使用解构来获取 login 函数



  useEffect(() => {
    async function fetchConfigs() {
      const myConfigs = await fetch("/assistants/", {  
        method: 'GET',  
        headers: {
          Accept: 'application/json',
          'Authorization': `Bearer ${authToken}`,
          },
      })
        .then((r) => r.json())
        .then((li) => li.map((c: Config) => ({ ...c, mine: true })));
      setConfigs(myConfigs);
    }

    fetchConfigs();
  }, []);


  const saveConfig = useCallback(
    async (
      name: string,
      config: Config["config"],
      files: File[],
      isPublic: boolean,
      assistantId?: string,
    ): Promise<string> => {
      const confResponse = await fetch(
        assistantId ? `/assistants/${assistantId}` : "/assistants",
        {
          method: assistantId ? "PUT" : "POST",
          body: JSON.stringify({ name, config, public: isPublic }),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            'Authorization': `Bearer ${authToken}`,
          },
        },
      );
      const savedConfig = (await confResponse.json()) as Config;
      if (files.length) {
        const assistant_id = savedConfig.assistant_id;
        const formData = files.reduce((formData, file) => {
          formData.append("files", file);
          return formData;
        }, new FormData());
        formData.append(
          "config",
          JSON.stringify({ configurable: { assistant_id } }),
        );
        await fetch(`/ingest`, {
          method: "POST",
          body: formData,
        });
      }
      setConfigs({ ...savedConfig, mine: true });
      return savedConfig.assistant_id;
    },
    [],
  );

  // 定义删除助手
  const deleteConfig = useCallback(async (assistant_id: string): Promise<void> => {  
    try {  
      const response = await fetch('/assistants/delete', {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
          Accept: 'application/json',  
          'Authorization': `Bearer ${authToken}`,
        },  
        body: JSON.stringify({ assistant_id }),  
      });  
    
      if (!response.ok) {  
        if (response.status === 402 || response.status === 401 || response.status === 422) {
          console.log('deleteConfig: 过期了');
  
        }else{
          alert(`出错了，${response.status}， 重新登录尝试该操作`)
        }
        throw new Error('Failed to delete the assistant.');  
      }  
    
      // 删除成功后，更新本地状态  

      const newConfigs = configs?.filter((c) => c.assistant_id !== assistant_id) ?? [];  
      setConfigs(newConfigs);
      // setConfigs((currentConfigs) => currentConfigs?.filter((c) => c.assistant_id !== assistant_id) ?? null);  
    
      // 或者在这里刷新列表，取决于你的需求  
      // fetchConfigs();  
    
    } catch (error) {  
      console.error('Error deleting config:', error);  
      // 可以在这里处理错误，例如显示提示信息  
    }  
  }, []); 

  return {
    configs,
    saveConfig, 
    deleteConfig, // 新添加的删除助手函数
  };
}

export default useConfigList;