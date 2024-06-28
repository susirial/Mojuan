# Glm4 测试

import os
from langchain_openai import ChatOpenAI

if __name__ == '__main__':

    glm4_model = ChatOpenAI(
        model_name="gLm-4-air",
        openai_api_base="https://open.bigmodel.cn/api/paas/v4",
        openai_api_key=os.getenv('MY_ZHIPUAI_API_KEY'),
        streaming=True,
        verbose=True,
    )
    for chunk in glm4_model.stream("你好，你是谁？"):
        print('-------------')
        print(chunk)

    pass
