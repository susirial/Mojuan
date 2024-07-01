export const TYPES = {
  agent: {
    id: "agent",
    title: "智能体",
    description:
      "模型可以使用任意数量的工具，根据用户指令自动运行工具。\n\n基于Langchain + LangGraph, 便于用户扩展，自定义智能体。",
    files: false, //暂时不上传文件
  },
  chatbot: {
    id: "chatbot",
    title: "聊天机器人",
    description:
      "基于大模型的预训练数据进行问答,支持本地模型和云端API调用",
    files: false,
  },
  chat_retrieval: {
    id: "chat_retrieval",
    title: "RAG",
    description:
      "RAG(检索增强生成),将本地知识(文档)发送给模型进行问答. 先进行文档召回,大模型基于文档内容回答用户的问题",
    files: true, 
  },
} as const;

export type TYPE_NAME = (typeof TYPES)[keyof typeof TYPES]["id"];

export const DROPZONE_CONFIG = {
  multiple: true,
  accept: {
    "text/*": [".txt", ".htm", ".html"],
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "application/msword": [".doc"],
  },
  maxSize: 10_000_000, // Up to 10 MB file size.
};
