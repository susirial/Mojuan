"""API to deal with file uploads via a runnable.

For now this code assumes that the content is a base64 encoded string.

The details here might change in the future.

For the time being, upload and ingestion are coupled
"""

from __future__ import annotations

import os
from typing import Any, BinaryIO, List, Optional

from langchain_community.document_loaders.blob_loaders.schema import Blob
from langchain_community.embeddings.baidu_qianfan_endpoint import QianfanEmbeddingsEndpoint
from langchain_community.embeddings.huggingface import HuggingFaceBgeEmbeddings, HuggingFaceEmbeddings
from langchain_community.vectorstores.chroma import Chroma
from langchain_community.vectorstores.elasticsearch import ElasticsearchStore

from langchain_community.vectorstores.pgvector import PGVector
from langchain_core.runnables import (
    ConfigurableField,
    RunnableConfig,
    RunnableSerializable,
)
from langchain_core.vectorstores import VectorStore
from langchain_openai import AzureOpenAIEmbeddings, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter, TextSplitter

from app.ingest import ingest_blob
from app.llm_cfg import ELASTIC_HOST_HTTP, ELASTIC_ACCESS_PASSWORD, DEFAULT_VDB_768_INDEX_NAME, VECTOR_QUERY_FIELD, \
    BCE_EMBEDDING_MODEL_PATH, BCE_EMBEDDING_MODEL_KWARGS, BCE_EMBEDDING_MODEL_ENCODE_KWARGS, MY_QIANFAN_AK, \
    MY_QIANFAN_SK, DEFAULT_VDB_1024_INDEX_NAME
from app.parsing import MIMETYPE_BASED_PARSER


def _guess_mimetype(file_bytes: bytes) -> str:
    """Guess the mime-type of a file."""
    try:
        import magic
    except ImportError as e:
        raise ImportError(
            "magic package not found, please install it with `pip install python-magic`"
        ) from e

    mime = magic.Magic(mime=True)
    mime_type = mime.from_buffer(file_bytes)
    return mime_type


def _convert_ingestion_input_to_blob(data: BinaryIO) -> Blob:
    """Convert ingestion input to blob."""
    file_data = data.read()
    mimetype = _guess_mimetype(file_data)
    file_name = data.name
    return Blob.from_data(
        data=file_data,
        path=file_name,
        mime_type=mimetype,
    )

class IngestRunnable(RunnableSerializable[BinaryIO, List[str]]):
    """Runnable for ingesting files into a vectorstore."""

    text_splitter: TextSplitter
    """Text splitter to use for splitting the text into chunks."""
    vectorstore: VectorStore
    """Vectorstore to ingest into."""
    assistant_id: Optional[str]
    thread_id: Optional[str]
    """Ingested documents will be associated with assistant_id or thread_id.
    
    ID is used as the namespace, and is filtered on at query time.
    """

    class Config:
        arbitrary_types_allowed = True

    @property
    def namespace(self) -> str:
        if (self.assistant_id is None and self.thread_id is None) or (
            self.assistant_id is not None and self.thread_id is not None
        ):
            raise ValueError(
                "Exactly one of assistant_id or thread_id must be provided"
            )
        return self.assistant_id if self.assistant_id is not None else self.thread_id

    def invoke(
        self, input: BinaryIO, config: Optional[RunnableConfig] = None
    ) -> List[str]:
        return self.batch([input], config)

    def batch(
        self,
        inputs: List[BinaryIO],
        config: RunnableConfig | List[RunnableConfig] | None = None,
        *,
        return_exceptions: bool = False,
        **kwargs: Any | None,
    ) -> List:
        """Ingest a batch of files into the vectorstore."""
        ids = []
        for data in inputs:
            blob = _convert_ingestion_input_to_blob(data)
            ids.extend(
                ingest_blob(
                    blob,
                    MIMETYPE_BASED_PARSER,
                    self.text_splitter,
                    self.vectorstore,
                    self.namespace,
                )
            )
        return ids

# 注意，嵌入模型和向量数据库 需要和 tools.py中一直

# 使用本地 BCE  嵌入
# embed_model = HuggingFaceEmbeddings(
#     model_name=BCE_EMBEDDING_MODEL_PATH,
#     model_kwargs=BCE_EMBEDDING_MODEL_KWARGS,
#     encode_kwargs=BCE_EMBEDDING_MODEL_ENCODE_KWARGS
# )

# 使用百度云端  BGE
os.environ["QIANFAN_AK"] = MY_QIANFAN_AK
os.environ["QIANFAN_SK"] = MY_QIANFAN_SK
embed_model = QianfanEmbeddingsEndpoint(model="bge_large_zh", endpoint="bge_large_zh")

# 使用本地 Chroma
from chromadb.config import Settings
vstore = Chroma(persist_directory="D:\\LLM\\my_projects\\chroma_db", embedding_function=embed_model,client_settings=Settings(anonymized_telemetry=False))

# 使用Elastic Search
# vstore = ElasticsearchStore(
#     es_url=ELASTIC_HOST_HTTP,
#     index_name=DEFAULT_VDB_1024_INDEX_NAME,
#     embedding=embed_model,
#     es_user="elastic",
#     vector_query_field=VECTOR_QUERY_FIELD,
#     es_password=ELASTIC_ACCESS_PASSWORD
# )

chunk_size = 1000
chunk_overlap = 200

ingest_runnable = IngestRunnable(
    text_splitter=RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap),
    vectorstore=vstore,
).configurable_fields(
    assistant_id=ConfigurableField(
        id="assistant_id",
        annotation=str,
        name="Assistant ID",
    ),
    thread_id=ConfigurableField(
        id="thread_id",
        annotation=str,
        name="Thread ID",
    ),
)
