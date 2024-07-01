import logging
from typing import List

from langchain.text_splitter import TextSplitter
from langchain_community.document_loaders import Blob
from langchain_community.document_loaders.base import BaseBlobParser
from langchain_core.documents import Document
from langchain_core.vectorstores import VectorStore

# 设置日志级别
logging.basicConfig(level=logging.DEBUG)

# 创建日志器对象
logger = logging.getLogger(__name__)

def _update_document_metadata(document: Document, namespace: str) -> None:
    """Mutation in place that adds a namespace to the document metadata."""
    document.metadata["namespace"] = namespace

    if document.metadata["source"] == None:
        document.metadata["source"] = 'None'



def _sanitize_document_content(document: Document) -> Document:
    """Sanitize the document."""
    # Without this, PDF ingestion fails with
    # "A string literal cannot contain NUL (0x00) characters".
    document.page_content = document.page_content.replace("\x00", "x")

def ingest_blob(
    blob: Blob,
    parser: BaseBlobParser,
    text_splitter: TextSplitter,
    vectorstore: VectorStore,
    namespace: str,
    *,
    batch_size: int = 100,
) -> List[str]:
    """Ingest a document into the vectorstore."""
    logging.info('创建新的文档索引：namespace[{}]'.format(namespace))
    docs_to_index = []
    ids = []
    for document in parser.lazy_parse(blob):
        docs = text_splitter.split_documents([document])
        for doc in docs:
            _sanitize_document_content(doc)
            _update_document_metadata(doc, namespace)
        docs_to_index.extend(docs)

        if len(docs_to_index) >= batch_size:
            ids.extend(vectorstore.add_documents(docs_to_index))
            docs_to_index = []

    if docs_to_index:
        ids.extend(vectorstore.add_documents(docs_to_index))
    print('文档索引完成：namespace[{}]'.format(namespace))
    return ids
