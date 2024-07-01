import os
from enum import Enum
from typing import Any, Mapping, Optional, Sequence, Union
from uuid import uuid4

from langchain_core.messages import AnyMessage
from langchain_core.runnables import (
    ConfigurableField,
    RunnableBinding,
)
from langgraph.checkpoint import CheckpointAt

from app.agent_types.glm4_agent import get_glmx_agent_executor

from app.agent_types.qwen_agent import get_qwen_agent_executor

from app.chatbot import get_chatbot_executor
from app.checkpoint import PostgresCheckpoint

from app.llms import (
    get_qianfan_llm,
    get_glmx_llm,
    get_qwen_cloud_llm,
)

from app.retrieval import get_retrieval_executor
from app.tools import (
    RETRIEVAL_DESCRIPTION,
    TOOLS,
    Arxiv,
    AvailableTools,
    Retrieval,
    get_retrieval_tool,
    get_retriever,
    ZhipuSearch,
)

# 选择展示的工具
Tool = Union[
    Arxiv,
    Retrieval,
    ZhipuSearch,
]


class AgentType(str, Enum):
    GLM4 = "智谱清言GLM4"
    QWEN_TURBO = "通义千问(qwen-turbo)"


DEFAULT_SYSTEM_MESSAGE = "你是一个乐于助人的AI助手"

CHECKPOINTER = PostgresCheckpoint(at=CheckpointAt.END_OF_STEP)

def get_agent_executor(
    tools: list,
    agent: AgentType,
    system_message: str,
    interrupt_before_action: bool,
):
    if agent == AgentType.GLM4:
        llm = get_glmx_llm()
        return get_glmx_agent_executor(
            tools, llm, system_message, interrupt_before_action, CHECKPOINTER
        )
    elif agent == AgentType.QWEN_TURBO:
        llm = get_qwen_cloud_llm()
        return get_qwen_agent_executor(
            tools, llm, system_message, interrupt_before_action, CHECKPOINTER
        )
    else:
        raise ValueError("Unexpected agent type")


class ConfigurableAgent(RunnableBinding):
    tools: Sequence[Tool]
    agent: AgentType
    system_message: str = DEFAULT_SYSTEM_MESSAGE
    retrieval_description: str = RETRIEVAL_DESCRIPTION
    interrupt_before_action: bool = False
    assistant_id: Optional[str] = None
    thread_id: Optional[str] = None
    user_id: Optional[str] = None

    def __init__(
        self,
        *,
        tools: Sequence[Tool],
        agent: AgentType = AgentType.GLM4,
        system_message: str = DEFAULT_SYSTEM_MESSAGE,
        assistant_id: Optional[str] = None,
        thread_id: Optional[str] = None,
        retrieval_description: str = RETRIEVAL_DESCRIPTION,
        interrupt_before_action: bool = False,
        kwargs: Optional[Mapping[str, Any]] = None,
        config: Optional[Mapping[str, Any]] = None,
        **others: Any,
    ) -> None:
        others.pop("bound", None)
        _tools = []
        for _tool in tools:
            if _tool["type"] == AvailableTools.RETRIEVAL:
                if assistant_id is None or thread_id is None:
                    raise ValueError(
                        "Both assistant_id and thread_id must be provided if Retrieval tool is used"
                    )
                _tools.append(
                    get_retrieval_tool(assistant_id, thread_id, retrieval_description)
                )
            else:
                tool_config = _tool.get("config", {})
                _returned_tools = TOOLS[_tool["type"]](**tool_config)
                if isinstance(_returned_tools, list):
                    _tools.extend(_returned_tools)
                else:
                    _tools.append(_returned_tools)
        _agent = get_agent_executor(
            _tools, agent, system_message, interrupt_before_action
        )
        agent_executor = _agent.with_config({"recursion_limit": 50})
        super().__init__(
            tools=tools,
            agent=agent,
            system_message=system_message,
            retrieval_description=retrieval_description,
            bound=agent_executor,
            kwargs=kwargs or {},
            config=config or {},
        )


class LLMType(str, Enum):
    GLM4 = "智谱清言GLM4"
    QWEN_TURBO = "通义千问(qwen-turbo)"
    ERNIE_Speed_128K = "ERNIE-Speed-128K"


def get_chatbot(
    llm_type: LLMType,
    system_message: str,
):
    if llm_type == LLMType.GLM4:
        llm = get_glmx_llm()
    elif llm_type == LLMType.QWEN_TURBO:
        llm = get_qwen_cloud_llm()
    elif llm_type == LLMType.ERNIE_Speed_128K:
        llm = get_qianfan_llm("ERNIE-Speed-128K")
    else:
        raise ValueError("Unexpected llm type: {}".format(llm_type))
    return get_chatbot_executor(llm, system_message, CHECKPOINTER)


class ConfigurableChatBot(RunnableBinding):
    llm: LLMType
    system_message: str = DEFAULT_SYSTEM_MESSAGE
    user_id: Optional[str] = None

    def __init__(
        self,
        *,
        llm: LLMType = LLMType.GLM4,
        system_message: str = DEFAULT_SYSTEM_MESSAGE,
        kwargs: Optional[Mapping[str, Any]] = None,
        config: Optional[Mapping[str, Any]] = None,
        **others: Any,
    ) -> None:
        others.pop("bound", None)

        chatbot = get_chatbot(llm, system_message)
        super().__init__(
            llm=llm,
            system_message=system_message,
            bound=chatbot,
            kwargs=kwargs or {},
            config=config or {},
        )


chatbot = (
    ConfigurableChatBot(llm=LLMType.GLM4, checkpoint=CHECKPOINTER)
    .configurable_fields(
        llm=ConfigurableField(id="llm_type", name="大模型类型"),
        system_message=ConfigurableField(id="system_message", name="系统指令"),
    )
    .with_types(input_type=Sequence[AnyMessage], output_type=Sequence[AnyMessage])
)


class ConfigurableRetrieval(RunnableBinding):
    llm_type: LLMType
    system_message: str = DEFAULT_SYSTEM_MESSAGE
    assistant_id: Optional[str] = None
    thread_id: Optional[str] = None
    user_id: Optional[str] = None

    def __init__(
        self,
        *,
        llm_type: LLMType = LLMType.GLM4,
        system_message: str = DEFAULT_SYSTEM_MESSAGE,
        assistant_id: Optional[str] = None,
        thread_id: Optional[str] = None,
        kwargs: Optional[Mapping[str, Any]] = None,
        config: Optional[Mapping[str, Any]] = None,
        **others: Any,
    ) -> None:
        others.pop("bound", None)
        retriever = get_retriever(assistant_id, thread_id)
        if llm_type == LLMType.GLM4:
            llm = get_glmx_llm()
        elif llm_type == LLMType.QWEN_TURBO:
            llm = get_qwen_cloud_llm()
        elif llm_type == LLMType.ERNIE_Speed_128K:
            llm = get_qianfan_llm("ERNIE-Speed-128K")
        else:
            raise ValueError("Unexpected llm type")
        chatbot = get_retrieval_executor(llm, retriever, system_message, CHECKPOINTER)
        super().__init__(
            llm_type=llm_type,
            system_message=system_message,
            bound=chatbot,
            kwargs=kwargs or {},
            config=config or {},
        )


chat_retrieval = (
    ConfigurableRetrieval(llm_type=LLMType.GLM4, checkpoint=CHECKPOINTER)
    .configurable_fields(
        llm_type=ConfigurableField(id="llm_type", name="大模型类型"),
        system_message=ConfigurableField(id="system_message", name="系统指令"),
        assistant_id=ConfigurableField(
            id="assistant_id", name="Assistant ID", is_shared=True
        ),
        thread_id=ConfigurableField(id="thread_id", name="Thread ID", is_shared=True),
    )
    .with_types(input_type=Sequence[AnyMessage], output_type=Sequence[AnyMessage])
)


agent = (
    ConfigurableAgent(
        agent=AgentType.GLM4,
        tools=[],
        system_message=DEFAULT_SYSTEM_MESSAGE,
        retrieval_description=RETRIEVAL_DESCRIPTION,
        assistant_id=None,
        thread_id=None,
    )
    .configurable_fields(
        agent=ConfigurableField(id="agent_type", name="Agent Type"),
        system_message=ConfigurableField(id="system_message", name="系统指令"),
        interrupt_before_action=ConfigurableField(
            id="interrupt_before_action",
            name="工具确认",
            description="如果选择是，代理将在执行每个工具之前提示您继续。\n如果选择否，代理将自动执行工具",
        ),
        assistant_id=ConfigurableField(
            id="assistant_id", name="Assistant ID", is_shared=True
        ),
        thread_id=ConfigurableField(id="thread_id", name="Thread ID", is_shared=True),
        tools=ConfigurableField(id="tools", name="Tools"),
        retrieval_description=ConfigurableField(
            id="retrieval_description", name="Retrieval Description"
        ),
    )
    .configurable_alternatives(
        ConfigurableField(id="type", name="Bot Type"),
        default_key="agent",
        prefix_keys=True,
        chatbot=chatbot,
        chat_retrieval=chat_retrieval,
    )
    .with_types(input_type=Sequence[AnyMessage], output_type=Sequence[AnyMessage])
)

if __name__ == "__main__":
    import asyncio

    from langchain.schema.messages import HumanMessage

    async def run():
        async for m in agent.astream_events(
            HumanMessage(content="whats your name"),
            config={"configurable": {"user_id": "2", "thread_id": "test1"}},
            version="v1",
        ):
            print(m)

    asyncio.run(run())
