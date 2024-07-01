import logging
import os
from functools import lru_cache
from langchain_community.chat_models.baidu_qianfan_endpoint import QianfanChatEndpoint
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_openai import ChatOpenAI
from app.llm_cfg import MY_QIANFAN_AK, MY_QIANFAN_SK, ZHIPU_AK, DASHSCOPE_API_KEY

logger = logging.getLogger(__name__)



@lru_cache(maxsize=2)
def get_qwen_cloud_llm(mode_name: str = 'qwen-turbo'):
    os.environ["DASHSCOPE_API_KEY"] = DASHSCOPE_API_KEY
    llm = ChatTongyi(
        model_name=mode_name,
        streaming=True,
    )
    return llm


@lru_cache(maxsize=4)
def get_glmx_llm(model_name: str = 'gLm-4-airx'):

    llm = ChatOpenAI(
        model_name=model_name,
        openai_api_base="https://open.bigmodel.cn/api/paas/v4",
        openai_api_key=ZHIPU_AK,
        streaming=False,
        verbose=True,
    )
    return llm

@lru_cache(maxsize=1)
def get_qianfan_llm(model_name:str=None):

    if not model_name:
        model_name = "ERNIE-Bot-4"
    os.environ["QIANFAN_AK"] = MY_QIANFAN_AK
    os.environ["QIANFAN_SK"] = MY_QIANFAN_SK

    print('[QianFan] use model:{}'.format(str(model_name)))
    chat = QianfanChatEndpoint(model=model_name)
    return chat

