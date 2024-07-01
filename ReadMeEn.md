

![show](https://github.com/susirial/Mojuan/blob/main/docs/introduction/look.png)

## Project Background

【1】Inspired by many projects, such as chatbot-ui, opengpts, gpt research…

【2】Many projects use Docker and other third-party services, which may be inconvenient to use in certain situations.

【3】Many projects use models like openai that are not easily accessible in China.

【4】 Demonstrates how to use Langchain for the development of LLm applications.

【5】 Utilize excellent large language models and embedding models from China.


**Highlights**

- This project attempts to use Chinese domestic models and, through relatively simple means, such as using local vector databases and relational databases, to build a locally accessible AI application that is easy for individuals to use.

- Frontend: Vite + ReAct, Backend: FastApi + Langchain

- Vector Database: Chroma/Elastic Search

- Relational Database: Postgres

---

## Demo
View the latest demo : www.chatroller.cn

## Quick Start for the Project

### **Frontend**:

```JavaScript
cd frontend
npm install
npm run dev
```



### **Backend**

#### 【1】 Install necessary packages

```JavaScript
pip install poetry
poetry install
pip install libmagic （linux）
pip install python-magic-bin （windows）
pip install qianfan
pip install zhipuai
pip install dashscope
pip install elasticsearch
pip install pandas
pip install appbuilder
pip install pydantic[email]
pip install passlib
pip install uvicorn
pip install bcrypt
pip install chromadb
pip install python-magic
```



#### 【2】 Install and configure the Postgres database 

- You can find installation tutorials for the Postgres database online. You can refer to the official website **https://www.postgresql.org/** for installation.

- It’s recommended to also install pgAdmin locally for easy management of the Postgres database **https://www.pgadmin.org/**

Create tables related to the project: Open pgAdmin and set up the relevant forms through the UI interface.

**<1> Create database: chatroller**
![db_1.png](https://github.com/susirial/Mojuan/blob/main/docs/introduction/db_1.png)


**<2> Open the Query Tool**

![db_2.png](https://github.com/susirial/Mojuan/blob/main/docs/introduction/db_2.png)

**<3> Enter the following commands one by one and execute them (to create tables within chatroller).**

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

### 【3】 Set project parameters
Find `backend/app/llm_cfg.py` and add the following parameters.

```JavaScript

# zhipu（required） : https://bigmodel.cn/dev/howuse/introduction 
ZHIPU_AK = os.environ["ZHIPU_AK"]

# qianfan（required） : https://qianfan.cloud.baidu.com/
MY_QIANFAN_AK = os.environ["MY_QIANFAN_AK"]
MY_QIANFAN_SK = os.environ["MY_QIANFAN_SK"]

# Qwen（required） : https://help.aliyun.com/zh/dashscope/developer-reference/api-details
DASHSCOPE_API_KEY = os.environ["DASHSCOPE_API_KEY"]

# Langsmith Key （optional）
MY_LANGCHAIN_API_KEY = os.environ["LANGCHAIN_API_KEY"]


# Postgres database settings: Local/Cloud（required）
POSTGRES_HOST = 'localhost'
POSTGRES_PORT = 5432
POSTGRES_DB = 'chatroller'
POSTGRES_USER = 'postgres'
POSTGRES_PASSWORD = os.environ["POSTGRES_PASSWORD"]
```

### 【4】 Start the backend.

```JavaScript
cd backend
uvicorn app.server:app --reload --port 8100
```

###【5】 Registration and Login

You need to register before logging in (no verification code is sent by email, you can implement it yourself). 
The email verification code needs to be checked from the database. You can use pgAdmin to open email_verification_codes to view.

select \* from email_verification_codes;

![image.png](https://github.com/susirial/Mojuan/blob/main/docs/introduction/db_3.png)
