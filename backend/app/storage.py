import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Union

from langchain_core.messages import AnyMessage

from app.agent import AgentType, get_agent_executor
from app.auth.charrol_handlers import chatrol_auth_handler
from app.lifespan import get_pg_pool
from app.schema import Assistant, Thread, User

# 设置日志级别
logging.basicConfig(level=logging.DEBUG)

# 创建日志器对象
logger = logging.getLogger(__name__)


async def list_assistants(user_id: str) -> List[Assistant]:
    """List all assistants for the current user."""
    logging.info('[获得助手列表] user_id:{}'.format(user_id))
    async with get_pg_pool().acquire() as conn:
        return await conn.fetch("SELECT * FROM assistant WHERE user_id = $1", user_id)

async def get_assistant(user_id: str, assistant_id: str) -> Optional[Assistant]:
    """Get an assistant by ID."""
    logging.info('[获得助手] user_id:[{}] assistant_id[{}]'.format(user_id, assistant_id))
    async with get_pg_pool().acquire() as conn:
        return await conn.fetchrow(
            "SELECT * FROM assistant WHERE assistant_id = $1 AND (user_id = $2 OR public = true)",
            assistant_id,
            user_id,
        )


async def put_assistant(
        user_id: str, assistant_id: str, *, name: str, config: dict, public: bool = False
) -> Assistant:
    """Modify an assistant.

    Args:
        user_id: The user ID.
        assistant_id: The assistant ID.
        name: The assistant name.
        config: The assistant config.
        public: Whether the assistant is public.

    Returns:
        return the assistant model if no exception is raised.
    """
    updated_at = datetime.now(timezone.utc)
    logging.info(
        '[修改助手] assistant_ids[{}]，user_id[{}] name[{}] public[{}] config[{}]'.format(assistant_id, user_id, name,
                                                                                         public, config))
    async with get_pg_pool().acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                (
                    "INSERT INTO assistant (assistant_id, user_id, name, config, updated_at, public) VALUES ($1, $2, $3, $4, $5, $6) "
                    "ON CONFLICT (assistant_id) DO UPDATE SET "
                    "user_id = EXCLUDED.user_id, "
                    "name = EXCLUDED.name, "
                    "config = EXCLUDED.config, "
                    "updated_at = EXCLUDED.updated_at, "
                    "public = EXCLUDED.public;"
                ),
                assistant_id,
                user_id,
                name,
                config,
                updated_at,
                public,
            )
    return {
        "assistant_id": assistant_id,
        "user_id": user_id,
        "name": name,
        "config": config,
        "updated_at": updated_at,
        "public": public,
    }


async def list_threads(user_id: str) -> List[Thread]:
    """List all threads for the current user."""
    logging.info('[获得聊天记录列表] user_id:{}'.format(user_id))
    async with get_pg_pool().acquire() as conn:
        return await conn.fetch("SELECT * FROM thread WHERE user_id = $1", user_id)


async def get_thread(user_id: str, thread_id: str) -> Optional[Thread]:
    """Get a thread by ID."""
    logging.info('[获得聊天记录] user_id:[{}] thread_id[{}]'.format(user_id, thread_id))
    async with get_pg_pool().acquire() as conn:
        return await conn.fetchrow(
            "SELECT * FROM thread WHERE thread_id = $1 AND user_id = $2",
            thread_id,
            user_id,
        )


# 删除聊天thread
async def delete_thread(user_id: str, thread_id: str) -> Optional[Thread]:
    """Get a thread by ID."""
    logging.info('[删除聊天thread] user_id:[{}] thread_id[{}]'.format(user_id, thread_id))
    async with get_pg_pool().acquire() as conn:
        try:
            # 使用execute方法执行删除操作
            delete_result = await conn.execute(
                "DELETE FROM thread WHERE thread_id = $1 AND user_id = $2",
                thread_id,
                user_id,
            )
            # 获取并返回删除的行数
            return delete_result
        except Exception as e:
            # 异常处理逻辑
            logging.error(f" 删除thread出现异常: {e}")
            return -1


# 删除聊天 checkpoint
async def delete_checkpoint(user_id: str, thread_id: str) -> Optional[Thread]:
    """Get a thread by ID."""
    logging.info('[删除聊天 checkpoint] user_id:[{}] thread_id[{}]'.format(user_id, thread_id))
    async with get_pg_pool().acquire() as conn:
        try:
            # 使用execute方法执行删除操作
            delete_result = await conn.execute(
                "DELETE FROM checkpoints WHERE  thread_id = $1",
                thread_id,
            )
            # 获取并返回删除的行数
            return delete_result
        except Exception as e:
            # 异常处理逻辑
            logging.error(f" 删除 checkpoint 出现异常: {e}")
            return -1


async def get_thread_state(user_id: str, thread_id: str):
    """Get state for a thread."""
    app = get_agent_executor([], AgentType.GLM4, "", False)
    state = await app.aget_state({"configurable": {"thread_id": thread_id}})
    # logging.info('[获得聊天状态] values:[{}] next[{}]'.format(state.values, state.next))
    return {
        "values": state.values,
        "next": state.next,
    }


async def update_thread_state(
        user_id: str, thread_id: str, values: Union[Sequence[AnyMessage], Dict[str, Any]]
):
    """Add state to a thread."""
    app = get_agent_executor([], AgentType.GLM4, "", False)
    # logging.info('[更新聊天状态] thread_id:[{}] values[{}]'.format(thread_id, values))
    await app.aupdate_state({"configurable": {"thread_id": thread_id}}, values)


async def get_thread_history(user_id: str, thread_id: str):
    """Get the history of a thread."""
    app = get_agent_executor([], AgentType.GLM4, "", False)
    return [
        {
            "values": c.values,
            "next": c.next,
            "config": c.config,
            "parent": c.parent_config,
        }
        async for c in app.aget_state_history(
            {"configurable": {"thread_id": thread_id}}
        )
    ]


async def put_thread(
        user_id: str, thread_id: str, *, assistant_id: str, name: str
) -> Thread:
    """Modify a thread."""
    updated_at = datetime.now(timezone.utc)
    # logging.info('[修改 put thread] thread_id:[{}] user_id[{}] assistant_id[{}] name[{}]'.format(thread_id, user_id,
    #                                                                                              assistant_id, name))
    async with get_pg_pool().acquire() as conn:
        await conn.execute(
            (
                "INSERT INTO thread (thread_id, user_id, assistant_id, name, updated_at) VALUES ($1, $2, $3, $4, $5) "
                "ON CONFLICT (thread_id) DO UPDATE SET "
                "user_id = EXCLUDED.user_id,"
                "assistant_id = EXCLUDED.assistant_id, "
                "name = EXCLUDED.name, "
                "updated_at = EXCLUDED.updated_at;"
            ),
            thread_id,
            user_id,
            assistant_id,
            name,
            updated_at,
        )
        return {
            "thread_id": thread_id,
            "user_id": user_id,
            "assistant_id": assistant_id,
            "name": name,
            "updated_at": updated_at,
        }


# 加密系统
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


# Chatroller  用户注册
async def chatrol_register(username: str, password: str, email: str):
    res_data = {
        'status': 0,
        'msg': ''
    }

    async with get_pg_pool().acquire() as conn:  # 从连接池中获取一个连接
        # 检查用户名是否存在
        user = await conn.fetchrow("SELECT * FROM cusers WHERE username = $1", username)
        if user:
            res_data['status'] = -1
            res_data['msg'] = '用户名已存在'
            print('用户注册出错：用户名已存在!')
            return res_data
            # 检查邮箱是否存在
        user = await conn.fetchrow("SELECT * FROM cusers WHERE user_email = $1", email)
        if user:
            res_data['status'] = -2
            res_data['msg'] = '邮箱已存在'
            print('用户注册出错：邮箱已存在!')
            return res_data

        # 哈希密码
        hashed_password = chatrol_auth_handler.get_password_hash(password)

        # 创建用户
        await conn.execute(
            "INSERT INTO cusers(username, user_email, hashed_password) VALUES ($1, $2, $3)",
            username, email, hashed_password
        )
        res_data['msg'] = '用户创建成功！'
        print('用户创建成功！')
        # 具体发送胜利
        return res_data

    # 密码校验函数


# 用户密码修改
async def chatrol_change_password(password: str, email: str):
    res_data = {
        'status': 0,
        'msg': '用户密码更新完成'
    }
    print('[用户密码修改] 用户邮箱[{}]'.format(email))
    async with get_pg_pool().acquire() as conn:  # 从连接池中获取一个连接
        # 哈希新密码
        hashed_password = chatrol_auth_handler.get_password_hash(password)
        try:
            # 更新用户密码
            await conn.execute(
                """  
                UPDATE cusers  
                SET hashed_password = $1  
                WHERE user_email = $2  
                """,
                hashed_password, email
            )
        except Exception as e:
            print('[用户密码修改] 异常: {}'.format(e))
            res_data['status'] =  -1
            res_data['msg'] = '用户密码修改失败！'
    return  res_data



def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# 用户正式登录
async def chatrol_login(email: str, password: str):
    res_data = {
        'status': 0,
        'msg': '登录成功！',
        'token': ''
    }
    async with get_pg_pool().acquire() as conn:  # 从连接池中获取一个连接
        # 检查用户是否存在
        user = await conn.fetchrow("SELECT * FROM cusers WHERE user_email = $1", email)
        if user is None:
            res_data['status'] = -2
            res_data['msg'] = '用户不存在!'
            print('[chatrol_login] 用户不存在!')
            return res_data

            # 验证密码
        if not chatrol_auth_handler.verify_password(password, user['hashed_password']):
            res_data['status'] = -1
            res_data['msg'] = '无效的用户名|密码!!'
            print('[chatrol_login] 无效的用户名|密码!')
            return res_data

            # 生成Token
        token = chatrol_auth_handler.encode_token(str(user['user_id']))

        print('--------------------------------------')
        print('用户ID： {}'.format(str(user['user_id'])))
        print('生成token: {}'.format(token))

        # 更新最后登录时间
        await conn.execute(
            "UPDATE cusers SET last_login = $1 WHERE user_email = $2",
            datetime.now(timezone.utc), email
        )
        print('[chatrol_login] 用户登录成功!！')
        return {
            "status": 0,
            "msg": "获取token成功！",
            "token": token
        }



# -----
# 列举某个用户的信息,不返回密码
async def chatrol_get_user_by_id(user_id: uuid.UUID):
    res_data = {
        'status': 0,
        'msg': '获取用户信息成功！',
        'user_data': None
    }

    print('[查找用户信息] uid: {}'.format(user_id))
    try:
        async with get_pg_pool().acquire() as conn:  # 从连接池中获取一个连接

            user = await conn.fetchrow(
                "SELECT username, user_email , doc_visit_days,last_login,user_id,user_mask ,user_group,user_status,hl_llm_visit_days FROM cusers WHERE user_id = $1",
                user_id)
            if user is None:
                res_data['status'] = -1
                res_data['msg'] = '没有找到用户'
            else:
                res_data['user_data'] = user
    except Exception as e:
        res_data['status'] = -2
        res_data['msg'] = '获取用户异常!'
        print('获取用户异常! {}'.format(e))

    return res_data


# -----
# 根据 user_id 更新部分用户信息
from pydantic import BaseModel


class UserUpdate(BaseModel):
    doc_visit_days: Optional[int] = None
    user_mask: Optional[int] = None
    user_group: Optional[str] = None
    user_status: Optional[str] = None
    hl_llm_visit_days: Optional[int] = None


async def chatrol_update_user_by_id(user_id: uuid.UUID, user_update: UserUpdate):
    res_data = {
        'status': 0,
        'msg': '用户信息更新成功！',
        'user_data': None
    }

    print('[更新用户信息] uid: {}'.format(user_id))
    try:
        async with get_pg_pool().acquire() as conn:  # 从连接池中获取一个连接
            # 构造更新语句，只更新非None字段
            set_clause = ', '.join(f"{key} = ${i + 2}" for i, key in enumerate(user_update.dict(exclude_none=True)))
            values = list(user_update.dict(exclude_none=True).values())

            if not set_clause:
                res_data['status'] = -2
                res_data['msg'] = '没有需要更新的内容'
                return res_data

            query = f"UPDATE cusers SET {set_clause} WHERE user_id = $1 RETURNING *"
            updated_user = await conn.fetchrow(query, user_id, *values)
            if updated_user is None:
                res_data['status'] = -1
                res_data['msg'] = '没有找到用户'
            else:
                res_data['user_data'] = dict(updated_user)
    except ValueError as e:
        res_data['status'] = -3
        res_data['msg'] = '没有提供更新字段!'
        print('没有提供更新字段! {}'.format(e))
    except Exception as e:
        res_data['status'] = -2
        res_data['msg'] = '更新用户异常!'
        print('更新用户异常! {}'.format(e))

    return res_data



# 邮箱验证操作

# 生成邮箱认证随机码
import string
import secrets
from datetime import datetime, timedelta


def generate_random_code():
    characters = string.ascii_letters + string.digits  # 可选字符集合为字母和数字
    code = ''.join(secrets.choice(characters) for _ in range(4))  # 生成4位随机码
    return code


from fastapi import HTTPException, status


# 用户注册时，验证码 发送
async def verify_email_and_send_code(email: str):
    async with get_pg_pool().acquire() as conn:
        # 开始一个事务
        async with conn.transaction():
            # 检查邮箱是否已存在于用户表
            user = await conn.fetchrow("SELECT * FROM cusers WHERE user_email = $1", email)
            if user:
                print('[邮箱验证] 邮箱已存在！')
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="邮箱已存在")

                # 生成验证码
            email_verify_code = generate_random_code()
            expires_at = datetime.now() + timedelta(minutes=10)

            # 检查是否已经存在验证码记录
            existing_code = await conn.fetchrow("SELECT * FROM email_verification_codes WHERE email = $1", email)
            if existing_code:
                # 更新现有记录
                await conn.execute(
                    "UPDATE email_verification_codes SET code = $2, expires_at = $3, is_used = FALSE WHERE email = $1",
                    email, email_verify_code, expires_at
                )
            else:
                # 插入新记录
                await conn.execute(
                    "INSERT INTO email_verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
                    email, email_verify_code, expires_at
                )

                # 发送验证码邮件
            try:
                official_email = "这里写你要从哪里发送"
                subject = "你要发送邮件的标题"
                message = f"你要发送信息的内容"

                # 发送邮件的操作

                # 模拟成功
                email_res = {
                    'status': 0,
                }

                if email_res['status'] == -1:
                    print(
                        "Error: sender[{}] send email to [{}] failed .. e[{}]".format(official_email, email,
                                                                                      email_res['msg']))
                    print('[邮箱验证] Ali接口发邮件失败！')
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="邮箱发送出错")

            except Exception as e:
                # 打印日志或记录异常信息
                print(f"Error: sender[{official_email}] send email to [{email}] failed .. e[{e}]")

                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="邮件发送异常")

            print(f"邮件发送： sender[{official_email}] send email to [{email}] OK！")
            return {"msg": "验证码已发送", "status": 0}

# 用户重置密码时，验证码发送
async def verify_email_and_send_code_for_psw(email: str):
    async with get_pg_pool().acquire() as conn:
        # 开始一个事务
        async with conn.transaction():
            # 生成验证码
            email_verify_code = generate_random_code()
            expires_at = datetime.now() + timedelta(minutes=10)

            # 检查是否已经存在验证码记录
            existing_code = await conn.fetchrow("SELECT * FROM email_verification_codes WHERE email = $1", email)
            if existing_code:
                # 更新现有记录
                await conn.execute(
                    "UPDATE email_verification_codes SET code = $2, expires_at = $3, is_used = FALSE WHERE email = $1",
                    email, email_verify_code, expires_at
                )
            else:
                # 插入新记录
                await conn.execute(
                    "INSERT INTO email_verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
                    email, email_verify_code, expires_at
                )

            # 发送验证码邮件
            try:
                official_email = "你从哪里发送"
                subject = "你要发送的标题"
                message = f"你要发送的消息内容"

                # # 发送邮件的操作

                # 模拟成功
                email_res = {
                    'status': 0,
                }

                if email_res['status'] == -1:
                    print(
                        "Error: sender[{}] send email to [{}] failed .. e[{}]".format(official_email, email,
                                                                                      email_res['msg']))
                    print('[邮箱验证] Ali接口发邮件失败！')
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="邮箱发送出错")

            except Exception as e:
                print(f"Error: sender[{official_email}] send email to [{email}] failed .. e[{e}]")
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="邮件发送异常")

            print(f"邮件发送： sender[{official_email}] send email to [{email}] OK！")
            return {"msg": "验证码已发送", "status": 0}


# 根据用户发来的邮箱和验证码，在数据库里匹配
async def verify_email_code(email: str, code: str):
    print('[邮箱和验证码匹配]  email[{}] code[{}]'.format(email, code))

    async with get_pg_pool().acquire() as conn:
        # 开始一个事务
        async with conn.transaction():
            try:
                # 从数据库中获取验证码记录
                verification_code_record = await conn.fetchrow(
                    "SELECT * FROM email_verification_codes WHERE email = $1", email
                )

                # 检查验证码记录是否存在
                if verification_code_record is None:
                    print('[邮箱和验证码匹配] 验证码不存在')
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="验证码不存在")

                    # 检查验证码是否已过期
                expires_at = verification_code_record['expires_at']
                if datetime.now() > expires_at:
                    print('[邮箱和验证码匹配] 验证码已过期')
                    raise HTTPException(status_code=status.HTTP_410_GONE, detail="验证码已过期")

                # 检查提供的验证码是否匹配
                if verification_code_record['code'] != code:
                    print('[邮箱和验证码匹配] 验证码错误')
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="验证码错误")

                    # 验证码匹配成功，更新验证码记录为已使用
                await conn.execute(
                    "UPDATE email_verification_codes SET is_used = TRUE WHERE email = $1",
                    email
                )

                # 返回成功消息
                print('[邮箱和验证码匹配] 成功！')
                return {"msg": "验证码匹配成功", "status": 0}

            except HTTPException as http_exc:
                # 抛出上面已定义的HTTP异常
                raise http_exc
            except Exception as e:
                # 发生其他异常时，打印日志并抛出通用的HTTP异常
                print(f"Error: 验证码匹配过程中发生异常 .. e[{e}]")
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="服务器错误")




# 删除跟某个Asisstant ID 相关的所有数据
async def delete_assistant_data(assistant_id: uuid.UUID):
    res_data = {
        'status':0,
        'msg':''
    }
    async with get_pg_pool().acquire() as conn:  # 获取连接
        async with conn.transaction():  # 开启事务
            # 首先删除 checkpoints 表中相关的数据
            # 我们需要使用 assistant_id 在 thread 表中查找相应的 thread_id
            await conn.execute(
                """  
                DELETE FROM checkpoints  
                USING thread  
                WHERE checkpoints.thread_id::uuid = thread.thread_id  
                AND thread.assistant_id = $1  
                """,
                assistant_id
            )
            # 接下来删除 thread 表中的相关数据
            await conn.execute(
                """  
                DELETE FROM thread  
                WHERE assistant_id = $1  
                """,
                assistant_id
            )
            # 最后删除 assistant 表中的记录
            deleted = await conn.execute(
                """  
                DELETE FROM assistant  
                WHERE assistant_id = $1  
                """,
                assistant_id
            )
            # 检查是否有行被删除
            if deleted != "DELETE 1":
                res_data['status'] = -1
                res_data['msg'] = '助手 [{}] 没找到'.format(assistant_id)
            else:
                print('------------------deleted : {}'.format(deleted))
                res_data['msg'] = '删除助手 {} 相关数据成功! '.format(assistant_id)
    return res_data
