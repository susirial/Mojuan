## 项目背景

【1】受到很多项目启示，比如 chatbot-ui, opengpts，gpt research ...

【2】很多项目使用 Docker 和其他一些第三方服务，这些服务可能在某些情况下不方便使用

【3】很多项目使用 openai 等一些国内不方便使用的模型

【4】很多小伙伴不知道如何从 0 构建自己的 AI 应用

**亮点**

- 这个项目尝试使用国内的模型，通过相对简单的方式，比如使用本地向量数据库，关系数据库

  来建立一个易于个人使用的本地 AI 应用。

- 前端采用 Vite + ReAct， 后端使用 FastApi + Langchain

- 向量数据库：Chroma

- 关系数据库：Sqlite

---

项目快速启动

前端：

```JavaScript
cd frontend
npm install
npm run dev
```

后端

```JavaScript
cd backend
pip install -r requirements.txt

# 设置环境变量 法<1>
# Glm4 MY_ZHIPUAI_API_KEY： 你的智谱AI Key
# 比如 windows : set MY_ZHIPUAI_API_KEY=你的KEY

# 设置环境变量 法<2>
在pycharm 中添加环境变量: 点击 Run->Edit Configutations ->Environment Varialbles

# 启动后端服务 法<1>
uvicorn Fastapi.server:app --reload

# 启动后端服务 法<2>
# pycharm 中直接运行 server.py 中的main函数

```

---

**项目处于边教学边开发阶段， 有问题麻烦发送到我的邮箱 support@chatroller.com**

B 站视频：[https://www.bilibili.com/video/BV1rz421875f/](https://www.bilibili.com/video/BV1rz421875f/)

运行起来之后， 可以在 router.tsx 中查看目前可用的 url

启动对话界面： [http://localhost:5173/chathomev3](http://localhost:5173/chathomev3)
