export interface Message {
    role: Role;
    content: string;
  }

  // V3
export interface MessageWithFiles {
  role: Role;
  content: string;
  files?: File[];
}


export interface MessageWithFilesV2 {
  id: string;
  type: string;
  content:
    | string
    | { page_content: string; metadata: Record<string, object> }[]
    | object;
  name?: string;
  additional_kwargs?: {
    name?: string;
    function_call?: {
      name?: string;
      arguments?: string;
    };
    tool_calls?: {
      id: string;
      function?: {
        name?: string;
        arguments?: string;
      };
    }[];
  };
  example: boolean;
  files?: File[];
}
  
  export type Role = "assistant" | "user";