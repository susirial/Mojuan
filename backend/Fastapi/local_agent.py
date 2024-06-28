# 项目使用的 Agent 定义
import os
from langchain import hub
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from typing import List
from langchain_core.messages import HumanMessage, BaseMessage
from langgraph.graph import END, MessageGraph
from langgraph.prebuilt import create_react_agent

# 智谱AI
glm4_model = ChatOpenAI(
    model_name="gLm-4-air",
    openai_api_base="https://open.bigmodel.cn/api/paas/v4",
    openai_api_key=os.getenv('MY_ZHIPUAI_API_KEY'),
    streaming=True,
    verbose=True,
)

# 使用本地网易有道模型  BCE， 使用CPU
embedding_model_name = 'D:\LLM\\bce_modesl\\bce-embedding-base_v1'
embedding_model_kwargs = {'device': 'cpu'}
embedding_encode_kwargs = {'batch_size': 32, 'normalize_embeddings': True, }

embed_model = HuggingFaceEmbeddings(
    model_name=embedding_model_name,
    model_kwargs=embedding_model_kwargs,
    encode_kwargs=embedding_encode_kwargs
)

# 生成检索器
vector_store = Chroma(persist_directory="D:\\LLM\\my_projects\\chroma_db", embedding_function=embed_model)
retriever = vector_store.as_retriever(search_kwargs={"k": 6})

# 建立查询连
prompt = hub.pull("rlm/rag-prompt")


# 将文档连接成字符串
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


# 检索 + 回答 chain
rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | glm4_model
        | StrOutputParser()
)

# 文档提问 （简单）
file_query_system_template = """
你是一个AI助手，帮助人们解决问题.用户会上传一些文件，如果文件中包含问题的答案，请直接回答，
如果文件中不包含问题的答案，你需要先告诉用户无法从文档中找到答案，然后再根据你的知识解答。
文件内容如下：{context}
"""
file_query_prompt_template = ChatPromptTemplate.from_messages(
    [("system", file_query_system_template), ("user", "{query}")]
)

file_query_chain = file_query_prompt_template | glm4_model | StrOutputParser()



# Langgraph 基本模型问答
# 定义一个消息图
graph = MessageGraph()
def invoke_model(state: List[BaseMessage]):
    return glm4_model.stream(state)

# 定义一个节点
graph.add_node("start", invoke_model)
graph.add_edge("start", END)
# 定义逻辑入口
graph.set_entry_point("start")
# 由图生成一个 runnable
from langgraph.checkpoint.sqlite import SqliteSaver
memory = SqliteSaver.from_conn_string("./chat_history.db")
llm_app = graph.compile(checkpointer=memory)


# 定义一个 模型对话Agent
llm_agent_executor = create_react_agent(glm4_model, [],checkpointer=memory)


