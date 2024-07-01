import logging
import secrets

import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ChatRolAuthHandler():

    security = HTTPBearer()
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    # 需要修改
    secret = 'Change_me_to_something_secret'


    def get_password_hash(self, password):
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def encode_token(self, user_id):
        payload = {
            'exp': datetime.utcnow() + timedelta(days=0, minutes=60*24*7),
            'iat': datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            self.secret,
            algorithm='HS256'
        )

    def decode_token(self, token):

        try:
            payload = jwt.decode(token, self.secret, algorithms=['HS256'])
            logger.info('Token decoded successfully: %s', payload)
            return payload['sub']
        except jwt.ExpiredSignatureError:
            logger.warning('Token expired: %s', token)
            raise HTTPException(status_code=401, detail='Token Outof Date')
        except jwt.InvalidTokenError as e:
            logger.error('Invalid token: %s', token)
            raise HTTPException(status_code=401, detail='invalid token')

    def auth_wrapper(self, auth: HTTPAuthorizationCredentials = Security(security)):
        logger.info('Authorization header: %s', auth.credentials)
        try:
            user_id = self.decode_token(auth.credentials)
            logger.info('Auth wrapper decoded user_id: %s', user_id)
            return user_id
        except HTTPException as e:
            logger.exception('Authentication failed: %s', e.detail)
            raise e


chatrol_auth_handler = ChatRolAuthHandler()


