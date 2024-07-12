![wlcome](https://github.com/susirial/Mojuan/blob/main/new_aigc_cover.png)
![show](https://github.com/susirial/Mojuan/blob/main/docs/introduction/look.png)

[中文](https://github.com/susirial/Mojuan/blob/main/README.md) ｜ [English ](https://github.com/susirial/Mojuan/blob/main/ReadMeEn.md)

## 项目背景

【1】受到很多项目启示，比如 chatbot-ui, opengpts，gpt research ...

【2】很多项目使用 Docker 和其他一些第三方服务，这些服务可能在某些情况下不方便使用

【3】很多项目使用 openai 等一些国内不方便使用的模型

【4】 展示如何使用 Langchain 进行 LLm 应用开发

【5】 使用国内优秀的大语言模型、嵌入模型

**亮点**

- 这个项目尝试使用国内的模型，通过相对简单的方式，比如使用本地向量数据库，关系数据库

  来建立一个易于个人使用的本地 AI 应用。

- 前端采用 Vite + ReAct， 后端使用 FastApi + Langchain

- 向量数据库：Chroma/Elastic Search

- 关系数据库：Postgres

---

## Demo

View the latest demo : www.chatroller.cn

项目快速启动

前端：

```JavaScript
cd frontend
npm install
npm run dev
```

# 后端

## 【1】 安装必要的包 
    请不要手动安装langchain包或者将项目放在有langchian的环境
    项目使用特定版本的langchain

    cd backend
    pip install -r requirements.txt

---

## 【2】安装和配置 Postgres 数据库

- 大家可以从网上找一下 Postgres **数据库** 安装教程。可以参考官网[https://www.postgresql.org/](https://www.postgresql.org/) 来安装。

- 最好本地再安装上 pgAdmin 轻松管理 Postgres 数据库 [https://www.pgadmin.org/](https://www.pgadmin.org/)

**生成项目相关的表 ：** 打开 pgAdmin， 通过 UI 界面设置相关表单

<1> 建立数据库 ： **chatroller**

![db_1.png](https://github.com/susirial/Mojuan/blob/main/docs/introduction/db_1.png)

<2> 打开 Query Tool

![db_2.png](https://github.com/susirial/Mojuan/blob/main/docs/introduction/db_2.png)

<3> 依次输入下面的命令并执行 （在**chatroller 中创建表**）

```JavaScript
【1】
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

【2】
CREATE TABLE cusers (
    id SERIAL,
    username VARCHAR(255) UNIQUE NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    doc_visit_days INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,
    user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_mask INTEGER DEFAULT 1,
    user_group VARCHAR(50) DEFAULT 'free',
    user_status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    hl_llm_visit_days INTEGER DEFAULT 0
);

【3】
CREATE TABLE email_verification_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE
);

【4】
CREATE TABLE IF NOT EXISTS assistant (
    assistant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    config JSON NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    public BOOLEAN NOT NULL
);

【5】
CREATE TABLE IF NOT EXISTS thread (
    thread_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assistant_id UUID REFERENCES assistant(assistant_id) ON DELETE SET NULL,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
);

【6】
CREATE TABLE IF NOT EXISTS checkpoints (
    thread_id TEXT,
    checkpoint BYTEA,
    thread_ts TIMESTAMPTZ,
    parent_ts TIMESTAMPTZ
);

【7】
ALTER TABLE checkpoints
    DROP CONSTRAINT IF EXISTS checkpoints_pkey,
    ADD PRIMARY KEY (thread_id),
    ADD COLUMN IF NOT EXISTS thread_ts TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS parent_ts TIMESTAMPTZ;


【8】
UPDATE checkpoints
    SET thread_ts = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
WHERE thread_ts IS NULL;

【9】
ALTER TABLE checkpoints
    DROP CONSTRAINT IF EXISTS checkpoints_pkey,
    ADD PRIMARY KEY (thread_id, thread_ts);

【10】
ALTER TABLE assistant
    DROP CONSTRAINT IF EXISTS fk_assistant_user_id,
    ALTER COLUMN user_id TYPE VARCHAR USING (user_id::text);

【11】
ALTER TABLE thread
    DROP CONSTRAINT IF EXISTS fk_thread_user_id,
    ALTER COLUMN user_id TYPE VARCHAR USING (user_id::text);
```

## 【3】设置项目使用的参数

找到 backend/app/llm_cfg.py，增加下面的参数

```JavaScript

# 智谱AI(必须) ： https://bigmodel.cn/dev/howuse/introduction
ZHIPU_AK = os.environ["ZHIPU_AK"]

# 千帆(必须) ： https://qianfan.cloud.baidu.com/
MY_QIANFAN_AK = os.environ["MY_QIANFAN_AK"]
MY_QIANFAN_SK = os.environ["MY_QIANFAN_SK"]

# 通义千问(必须) ：https://help.aliyun.com/zh/dashscope/developer-reference/api-details
DASHSCOPE_API_KEY = os.environ["DASHSCOPE_API_KEY"]

# Langsmith Key(可选)
MY_LANGCHAIN_API_KEY = os.environ["LANGCHAIN_API_KEY"]


# Postgres数据库: 本地、云端 均可 (必须)
POSTGRES_HOST = 'localhost'
POSTGRES_PORT = 5432
POSTGRES_DB = 'chatroller'
POSTGRES_USER = 'postgres'
POSTGRES_PASSWORD = os.environ["POSTGRES_PASSWORD"]

```

## 【4】启动后端

```JavaScript
cd backend
uvicorn app.server:app --reload --port 8100
```

---

## 【5】注册登录

登录时需要先注册（邮箱并没有发送验证码，你可以自己实现），邮箱的验证码需要从数据库里查看。可以用 pgAdmin 打开 email_verification_codes 查看

select \* from email_verification_codes;

![image.png](https://github.com/susirial/Mojuan/blob/main/docs/introduction/db_3.png)

**有问题麻烦发送到我的邮箱 support@chatroller.com**

B 站视频：[https://www.bilibili.com/video/BV1rz421875f/](https://www.bilibili.com/video/BV1rz421875f/)

启动对话界面： [http://localhost:5173](http://localhost:5173)
登录界面： [http://localhost:5173/signin](http://localhost:5173/signin)
