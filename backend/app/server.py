import logging
import os
import uuid
from pathlib import Path

import orjson
from fastapi import FastAPI, Form, UploadFile
from fastapi.staticfiles import StaticFiles

import app.storage as storage
from app.api import router as api_router
from app.lifespan import lifespan
from app.upload import ingest_runnable
# ChatRol Auth
from pydantic import BaseModel, Field, EmailStr
from fastapi import Depends, HTTPException
from app.auth.charrol_handlers import chatrol_auth_handler
from typing_extensions import TypedDict

logger = logging.getLogger(__name__)

app = FastAPI(title="ChatRoller GPTs API", lifespan=lifespan)

ROOT = Path(__file__).parent.parent

app.include_router(api_router)


@app.post("/ingest", description="Upload files to the given assistant.")
async def ingest_files(
        files: list[UploadFile],
        config: str = Form(...),
        # user_id=Depends(chatrol_auth_handler.auth_wrapper)
) -> None:
    """Ingest a list of files."""
    config = orjson.loads(config)

    # 直接注入数据到 本地 Chroma

    # assistant_id = config["configurable"].get("assistant_id")
    # if assistant_id is not None:
    #     assistant = await storage.get_assistant(user_id, assistant_id)
    #     if assistant is None:
    #         print("Fatal Error : assistant {} not found for user {}".format(assistant_id,user_id))
    #         raise HTTPException(status_code=404, detail="Assistant not found.")
    #
    # thread_id = config["configurable"].get("thread_id")
    # if thread_id is not None:
    #     thread = await storage.get_thread(user_id, thread_id)
    #     if thread is None:
    #         print("Fatal Error : Thread  not found for user {} ".format())
    #         raise HTTPException(status_code=404, detail="Thread not found.")

    return ingest_runnable.batch([file.file for file in files], config)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}

class RegisterRes(TypedDict):
    status: int
    """The status of the register"""

    msg: str
    """The message of the register"""


chatrol_users = []


class AuthDetails(BaseModel):
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="用户密码")
    email: EmailStr = Field(..., description="用户邮箱")


class LoginDetails(BaseModel):
    email: EmailStr = Field(..., description="用户邮箱")
    password: str = Field(..., description="用户密码")

# 正式用户注册
@app.post('/register')
async def register(auth_details: AuthDetails) -> RegisterRes:
    print('[正式用户注册 ]： {} ： {} ： {}'.format(auth_details.username, auth_details.password, auth_details.email))
    res_data = await storage.chatrol_register(auth_details.username, auth_details.password, auth_details.email)
    return res_data


# 用户修改密码
class ChgPassDetails(BaseModel):
    password: str = Field(..., description="用户密码")
    email: EmailStr = Field(..., description="用户邮箱")


@app.post('/register/chgpass')
async def chatrol_change_password(auth_details: ChgPassDetails) -> RegisterRes:
    print('[用户修改密码 ]： {} ： {}'.format(auth_details.email, auth_details.password))
    res_data = await storage.chatrol_change_password(auth_details.password, auth_details.email)
    return res_data



class LoginRes(TypedDict):
    status: int
    """The status of the Login"""

    msg: str
    """The message of Login"""

    token: str
    """Token"""


# 正式用户登录
@app.post('/login')
async def login(auth_details: LoginDetails):
    res_data = await storage.chatrol_login(auth_details.email, auth_details.password)
    return res_data


# 根据用户ID ，获取用户信息
async def chatrol_get_user_by_id(user_id: uuid.UUID, request_user_id=Depends(chatrol_auth_handler.auth_wrapper)):
    """ 获得用户所有信息"""
    print('[根据用户ID ，获取用户信息] request 中用户：{}， 要求的用户{}'.format(request_user_id, user_id))
    res_data = await storage.chatrol_get_user_by_id(user_id)
    return res_data


# 根据token，获取当前用户信息
@app.get('/listusers/current/user')
async def chatrol_get_current_user(user_id_in_request=Depends(chatrol_auth_handler.auth_wrapper)):
    """ 获得用户所有信息"""
    print('[获得当前用户ID] {}'.format(user_id_in_request))
    res_data = await storage.chatrol_get_user_by_id(user_id_in_request)
    return res_data


# 通过邮箱，制作一个验证码
class VemailDetails(BaseModel):
    email: EmailStr = Field(..., description="用户邮箱")


@app.post("/vemail")
async def verify_email_and_send_code_endpoint(data: VemailDetails):
    res_data = await storage.verify_email_and_send_code(data.email)
    return res_data


# 重设密码时的 邮箱验证
@app.post("/vemail/chgpsw")
async def verify_email_and_send_code_for_psw(data: VemailDetails):
    print('向邮箱[{}] 发送 修改密码 的 邮箱验证码'.format(data.email))
    res_data = await storage.verify_email_and_send_code_for_psw(data.email)
    return res_data


# 通过邮箱和验证码，验证注册邮箱
class VemailDetailsWithEmailAndCode(BaseModel):
    email: EmailStr = Field(..., description="用户邮箱")
    code: str = Field(..., description="用户输入的邮箱验证码")


@app.post("/vemail/code")
async def verify_email_wit_code(data: VemailDetailsWithEmailAndCode):
    res_data = await storage.verify_email_code(data.email, data.code)
    return res_data

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8100)
