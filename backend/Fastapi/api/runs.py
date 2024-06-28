# 各种对话 stream

from fastapi import APIRouter
from langchain_core.messages import HumanMessage
from pydantic import BaseModel
from sse_starlette import EventSourceResponse

from Fastapi.local_agent import llm_agent_executor

router = APIRouter()

class StreamData(BaseModel):
    data: str

# 同步方法，在 Sqlite 中保存对话历史
@router.post("/stream/msg")
def query_file_stream_run(
    data: StreamData
):
    print('收到前端数据： {}'.format(data.data))

    def llm_talk(data: StreamData,thread_id = 'my_talk'):

        ai_content = ''

        # 用户输入转化成 langchain 内部用户消息
        input = HumanMessage(content=data.data)

        # 对话配置
        thread_cfg = {"configurable": {"thread_id": thread_id}}

        for chunk in llm_agent_executor.stream(
                {"messages": [input]}, config=thread_cfg
        ):
            # 内容 s['agent']['messages'][0].content
            print("----")
            print(chunk)
            ai_content += chunk['agent']['messages'][0].content
            yield chunk['agent']['messages'][0].content

        print('AI : {}'.format(ai_content))

    return EventSourceResponse(llm_talk(data))


