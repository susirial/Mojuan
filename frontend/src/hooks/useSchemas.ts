import { useEffect, useState } from "react";
import { simplifySchema } from "../utils/simplifySchema";
import { getDefaults } from "../utils/defaults";
import useChatRolAuth from './useChatRolAuth';
import { useNavigate } from "react-router-dom";

export interface SchemaField {
  type: string;
  title: string;
  description: string;
  enum?: string[];
  items?: SchemaField;
  allOf?: SchemaField[];
}

export interface Schemas {
  configSchema: null | {
    properties: {
      configurable: {
        properties: {
          [key: string]: SchemaField;
        };
      };
    };
  };
  configDefaults: null | {
    configurable?: {
      [key: string]: unknown;
    };
  };
}

function useSchemas() {
  const [schemas, setSchemas] = useState<Schemas>({
    configSchema: null,
    configDefaults: null,
  });
  const { authToken} = useChatRolAuth(); 
  const navigate = useNavigate();

  useEffect(() => {  
    async function fetchSchema() {  
      try {  
        const response = await fetch("/runs/config_schema", {  
          method: 'GET',  
          headers: {  
            Accept: 'application/json',  
            'Authorization': `Bearer ${authToken}`,  
          },  
        });  
  
        // 检查响应状态  
        if (response.status === 402 || response.status === 401 || response.status === 422) {  
          console.log(' useSchemas triggered')
          navigate('/signin', { state: { from: '/' } });  
          return; 
        } else if (!response.ok) {  
          navigate(`/500/${response.status}`);  
          return;  
        }  
  
        const configSchema = await response.json().then(simplifySchema);  
        setSchemas({  
          configSchema,  
          configDefaults: getDefaults(configSchema) as Record<string, unknown>,  
        });  
      } catch (error) {  
        // 处理 fetch 或 JSON 解析中的错误  
        console.error('An error occurred while fetching the schema:', error);  
      }  
    }  
  
    fetchSchema();  
  }, [authToken, navigate]); // 添加 navigate 和 authToken 到依赖列表  
  
  return schemas;  
}  
export default useSchemas;