# 用来测试 通过 checkpoints 方法保存对话历史
import os
from typing import List
import asyncio
from langchain_core.runnables import Runnable, RunnableConfig
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, BaseMessage
from langgraph.graph import END, MessageGraph
from typing import AsyncIterator, Optional, Sequence, Union
from langchain_core.messages import AnyMessage, BaseMessage, message_chunk_to_message
from langgraph.prebuilt import create_react_agent


if __name__ == '__main__':


    glm4_model = ChatOpenAI(
        model_name="gLm-4-air",
        openai_api_base="https://open.bigmodel.cn/api/paas/v4",
        openai_api_key=os.getenv('MY_ZHIPUAI_API_KEY'),
        streaming=True,
        verbose=True,
    )

    # 定义一个消息图
    graph = MessageGraph()

    # 定义
    def invoke_model(state: List[BaseMessage]):
        return glm4_model.invoke(state)

    # 定义一个节点
    graph.add_node("start", invoke_model)

    graph.add_edge("start", END)

    # 定义逻辑入口
    graph.set_entry_point("start")


    # 由图生成一个 runnable
    from langgraph.checkpoint.sqlite import SqliteSaver

    memory = SqliteSaver.from_conn_string("./chat_history.db")

    app = graph.compile(checkpointer=memory)

    thread_cfg = {"configurable": {"thread_id": "my_talk"}}
    inputs = HumanMessage(content="你好呀，茉卷是一个知识库的名字，它里面都是关于AIGC，CGIA 方面的知识，茉卷的代号是'buyaojuan',你知道茉卷么？")
    for event in app.stream(inputs, thread_cfg):
        for v in event.values():
            print(v)
    pass
    inputs = HumanMessage(content="茉卷的代号是什么？")
    for event in app.stream(inputs, thread_cfg):
        for v in event.values():
            print(v)
    pass

    # 获得聊天历史

    # 最后的消息
    res = app.get_state(thread_cfg)
    latest_msg = res.values
    print('latest_msg : {}'.format(latest_msg))

    res =  [
        {
            "values": c.values,
            "next": c.next,
            "config": c.config,
            "parent": c.parent_config,
        }
        for c in app.get_state_history(thread_cfg)
    ]
    chat_history = res[0]['values']
    pass

    # Agent
    agent_executor = create_react_agent(glm4_model, [],checkpointer=memory)

    for s in agent_executor.stream(
            {"messages": [HumanMessage(content="你好呀，茉卷是一个知识库的名字，它里面都是关于AIGC，CGIA 方面的知识，茉卷的代号是'buyaojuan',你知道茉卷么？")]}, config=thread_cfg
    ):
        print(s)
        print("----")

    for s in agent_executor.stream(
            {"messages": [HumanMessage(content="茉卷的代号是什么？")]}, config=thread_cfg
    ):
        print(s)
        # 内容 s['agent']['messages'][0].content
        print("----")

    res = agent_executor.get_state(thread_cfg)
    latest_msg = res.values['messages']
    print('latest_msg : {}'.format(latest_msg))

    res =  [
        {
            "values": c.values,
            "next": c.next,
            "config": c.config,
            "parent": c.parent_config,
        }
        for c in agent_executor.get_state_history(thread_cfg)
    ]
    chat_history = res[0]['values']
    pass



