import logging
import os
from enum import Enum
from functools import lru_cache
from typing import Optional

from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools.retriever import create_retriever_tool
from langchain_community.agent_toolkits.connery import ConneryToolkit
from langchain_community.embeddings.baidu_qianfan_endpoint import QianfanEmbeddingsEndpoint

from langchain_community.retrievers import (
    KayAiRetriever,
    PubMedRetriever,
    WikipediaRetriever,
)
from langchain_community.retrievers.you import YouRetriever
from langchain_community.tools import ArxivQueryRun, DuckDuckGoSearchRun
from langchain_community.tools.connery import ConneryService
from langchain_community.tools.tavily_search import (
    TavilyAnswer as _TavilyAnswer,
)
from langchain_community.tools.tavily_search import (
    TavilySearchResults,
)
from langchain_community.utilities.arxiv import ArxivAPIWrapper
from langchain_community.utilities.tavily_search import TavilySearchAPIWrapper
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import AzureOpenAIEmbeddings, ChatOpenAI
from langchain_robocorp import ActionServerToolkit
from typing_extensions import TypedDict
from zhipuai import ZhipuAI

from app.llm_cfg import MY_QIANFAN_AK, MY_QIANFAN_SK,ZHIPU_AK
from app.upload import vstore
from langchain_core.tools import tool

# 设置日志级别
logging.basicConfig(level=logging.DEBUG)

# 创建日志器对象
logger = logging.getLogger(__name__)



class ArxivInput(BaseModel):
    query: str = Field(description="search query to look up")



class AvailableTools(str, Enum):
    RETRIEVAL = "retrieval"
    ARXIV = "arxiv"
    ZHIPU_SEARCH = "zhipu_search"


class ToolConfig(TypedDict):
    ...


class BaseTool(BaseModel):
    type: AvailableTools
    name: Optional[str]
    description: Optional[str]
    config: Optional[ToolConfig]
    multi_use: Optional[bool] = False


class Arxiv(BaseTool):
    type: AvailableTools = Field(AvailableTools.ARXIV, const=True)
    name: str = Field("论文搜索工具 Arxiv", const=True)
    description: str = Field("搜索 [Arxiv](https://arxiv.org/).", const=True)
class ZhipuSearch(BaseTool):
    type: AvailableTools = Field(AvailableTools.ZHIPU_SEARCH, const=True)
    name: str = Field("智谱搜索引擎", const=True)
    description: str = Field("智谱搜索", const=True)


class Retrieval(BaseTool):
    type: AvailableTools = Field(AvailableTools.RETRIEVAL, const=True)
    name: str = Field("Retrieval", const=True)
    description: str = Field("Look up information in uploaded files.", const=True)


RETRIEVAL_DESCRIPTION = """Can be used to look up information that was uploaded to this assistant.
If the user is referencing particular files, that is often a good hint that information may be here.
If the user asks a vague question, they are likely meaning to look up info from this retriever, and you should call it!"""


def get_retriever(assistant_id: str, thread_id: str):
    logging.info('创建检索器: assistant_id[{}] thread_id[{}]'.format(assistant_id, thread_id))
    # 我们使用本地chroma ，先不区分
    retriever = vstore.as_retriever(search_type="similarity",search_kwargs={"k": 10})
    return retriever


@lru_cache(maxsize=5)
def get_retrieval_tool(assistant_id: str, thread_id: str, description: str):
    return create_retriever_tool(
        get_retriever(assistant_id, thread_id),
        "Retriever",
        description,
    )


@lru_cache(maxsize=1)
def _get_arxiv():
    return ArxivQueryRun(api_wrapper=ArxivAPIWrapper(), args_schema=ArxivInput)

@lru_cache(maxsize=1)
def _get_multiply():
    @tool
    def multiply(first_number: int, second_number: int):
        """将2个数相乘"""
        return first_number * second_number

    return multiply

@lru_cache(maxsize=1)
def _get_zhipu_search():
    @tool
    def zhipu_search(query: str):
        """
        智谱搜索引擎，输入一个字符串问题，返回字符串结果
        """
        client = ZhipuAI(api_key=ZHIPU_AK)

        tools = [{
            "type": "web_search",
            "web_search": {
                "enable": True,
            }
        }]

        messages = [{
            "role": "user",
            "content": query
        }]

        response = client.chat.completions.create(
            model="glm-4",
            messages=messages,
            tools=tools
        )

        msg = response.choices[0].message.content
        print('智谱搜索:\n 问题：{}\n 回答：{}'.format(query,msg))
        return msg

    return zhipu_search


TOOLS = {
    AvailableTools.ARXIV: _get_arxiv,
    AvailableTools.ZHIPU_SEARCH:_get_zhipu_search
}
