# 后端服务
import json
import os
from time import sleep
from typing import Union

from fastapi import FastAPI,UploadFile,Form,File
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from sse_starlette import EventSourceResponse

from Fastapi.be_database import FileCache
from Fastapi.glm4_rag_query_only import file_query_chain

# 增加 router
from Fastapi.api import router as api_router

app = FastAPI()

# 增加 router
app.include_router(api_router)


class Item(BaseModel):
    name: str
    price: float
    is_offer: Union[bool, None] = None


@app.get("/")
def read_root():
    return {"Hello": "World"}

class Item(BaseModel):
    name: str

@app.post("/testpost")
async def create_item(item: Item):
    msg = f'后端收到消息： {item.name}'
    print(msg)
    return {'param':msg}


class StreamData(BaseModel):
    data: str

# glm4 Model
glm4_model = ChatOpenAI(
    model_name="gLm-4-air",
    openai_api_base="https://open.bigmodel.cn/api/paas/v4",
    openai_api_key=os.getenv('MY_ZHIPUAI_API_KEY'),
    streaming=True,
    verbose=True,
)


def glm4_talk(data: StreamData):
    ai_content = ''
    for chunk in glm4_model.stream(data.data):
        # print('-------------')
        # print(chunk.content)
        ai_content += chunk.content
        yield chunk.content
    print('AI : {}'.format(ai_content))

@app.post("/stream")
async def stream_run(
    data: StreamData
):
    print('收到前端数据： {}'.format(data.data))
    return EventSourceResponse(glm4_talk(data))


# RAG Stream
# @app.post("/ragstream")
# async def rag_stream_run(
#     data: StreamData
# ):
#     print('收到前端数据： {}'.format(data.data))
#
#     def rag_talk(data:StreamData):
#         for chunk in rag_chain.stream(data.data):
#             print('-------------')
#             print(chunk)
#             yield chunk
#
#     return EventSourceResponse(rag_talk(data))


# MSG Stream
# 首先，定义一个 Message 模型来匹配前端发送的每个消息对象的结构
# class Message(BaseModel):
#     role: str
#     content: str
#
#
# # 然后，定义 StreamData 类来接收一个消息列表
# from typing import List
# class MsgStreamData(BaseModel):
#     data: List[Message]

@app.post("/msgstream")
async def rag_stream_run(
    data: StreamData
):
    print('收到前端数据： {}'.format(data.data))

    return EventSourceResponse(glm4_talk(data))


@app.post("/msgstream/file")
async def query_file_stream_run(
    data: StreamData
):
    print('收到前端数据： {}'.format(data.data))

    # 获取用户的文档
    context = file_cache.combine_all_files()
    print('[/query/file] 用户文档： {}'.format(context))

    def file_talk(data: StreamData,context):
        ai_content = ''
        for chunk in file_query_chain.stream({'query': data.data,'context': context}):
            # print('-------------')
            # print(chunk.content)
            ai_content += chunk
            yield chunk
        print('AI : {}'.format(ai_content))

    return EventSourceResponse(file_talk(data,context))


# 模拟文件存储（ Postgres/Redis/MongoDB ...）
file_cache = FileCache()

# 文件上传
# class UploadFileData(BaseModel):
#     files: list[UploadFile]
#     config: str

@app.post("/ingest", description="上传文件")
async def ingest_files(
    files: list[UploadFile],
    config: str = Form(...),
) -> None:
    # 解析 config
    config_data = json.loads(config)
    print("Config Content:", config_data)

    # 遍历每个上传的文件
    if files:
        for file in files:
            # 打印文件名
            print("File Name:", file.filename)

            # 读取文件内容（这里以文本形式读取）
            contents = await file.read()
            print("File Content:", contents)

            # 如果处理完毕，记得关闭文件
            await file.close()
            # 将文件内容添加到缓存中
            file_cache.add_file(file.filename, contents)

# 根据 thread 获得对话历史
class RequestThread(BaseModel):
    thread_id: str


@app.get("/test")
def read_root():
    return {"param": "你好！这里是后端"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_name": item.name, "item_id": item_id}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app,host='0.0.0.0',port=8100)