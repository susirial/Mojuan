# Key Settings
# ES 向量数据库
# ELASTIC_HOST_HTTP = os.environ["ELASTIC_HOST_HTTP"]
# ELASTIC_ACCESS_NAME = 'elastic'
# ELASTIC_ACCESS_PASSWORD = os.environ["ELASTIC_ACCESS_PASSWORD"]
import os

# 768 维度
DEFAULT_VDB_768_INDEX_NAME = 'index_ex_768_vectors'

DEFAULT_VDB_1024_INDEX_NAME = 'index_zh_1024_vectors'

DEFAULT_VDB_1536_INDEX_NAME = 'index_1536_vectors'

VECTOR_QUERY_FIELD = 'question_vectors'

# 本地GLM3-6B模型
# LOCAL_GLM3_6B_ENDPOINT = "http://127.0.0.1:9000/v1/chat/completions"

# zhipu
ZHIPU_AK = os.environ["ZHIPU_AK"]

# 千帆
MY_QIANFAN_AK = os.environ["MY_QIANFAN_AK"]

MY_QIANFAN_SK = os.environ["MY_QIANFAN_SK"]

# 通义千问 在线
DASHSCOPE_API_KEY = os.environ["DASHSCOPE_API_KEY"]

# 火山引擎
# ARK_AKEY = os.environ["ARK_AKEY"]
# ARK_SKEY = os.environ["ARK_SKEY"]
# ARK_DOUBAO_ENPOINT_128K = os.environ["ARK_DOUBAO_ENPOINT_128K"]

# BCE 嵌入模型
# 下面是windows 配置路径
MY_EMB_MODEL_BCE_PATH = 'D:\LLM\\bce_modesl\\bce-embedding-base_v1'

# 是否使用本地 BCE reranker
USE_RERANKER = True

# 是否使用相关内容抽取
USE_EXTRAVTOR = False

MY_LANGCHAIN_API_KEY = os.environ["LANGCHAIN_API_KEY"]

# reranker 路径
LOCAL_RERANKER_PATH = 'D:\LLM\\bce_modesl\\bce-reranker-base_v1'

# BCE
BCE_EMBEDDING_MODEL_PATH = 'D:\LLM\\bce_modesl\\bce-embedding-base_v1'
BCE_EMBEDDING_MODEL_KWARGS = {'device': 'cuda:0'}
BCE_EMBEDDING_MODEL_ENCODE_KWARGS = {'batch_size': 32, 'normalize_embeddings': True, }


# Postgres数据库: 本地、云端 均可
POSTGRES_HOST = 'localhost'
POSTGRES_PORT = 5432
POSTGRES_DB = 'chatroller'
POSTGRES_USER = 'postgres'
POSTGRES_PASSWORD = os.environ["POSTGRES_PASSWORD"]
