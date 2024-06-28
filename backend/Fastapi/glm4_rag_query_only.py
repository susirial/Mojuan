# Glm4 测试文件

import os
from langchain import hub
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

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




if __name__ == '__main__':

    # go_on = True
    # while go_on:
    #     query_text = input("你的问题: ")
    #
    #     if 'exit' in query_text:
    #         break
    #
    #     print("AI需要回答的问题 [{}]\n".format(query_text))
    #     #res = rag_chain.invoke(query_text)
    #     #print(res)
    #
    #     for chunk in rag_chain.stream(query_text):
    #         print('-------------')
    #         print(chunk)
    # res = file_query_chain.invoke({'query': '如何使用python','context': '这是一个测试文档'})
    # print(res)
    # pass

    for chunk in file_query_chain.stream({'query': '如何使用python','context': '这是一个测试文档'}):
        print('-------------')
        print(chunk)

