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
  
  export type Role = "assistant" | "user";