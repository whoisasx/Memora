from datetime import datetime, timedelta
import os
from passlib.context import CryptContext
import jwt
from dotenv import load_dotenv

load_dotenv()

secret_key=os.getenv('JWT_SECRET_KEY','dev-duplicate-secret')
algorithm="HS256"
access_token_expiry=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES','60'))

pwd_context=CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def get_password_hash(password: str)->str:
    return pwd_context.hash(password)

def verify_password(plain:str,hashed:str)->bool:
    return pwd_context.verify(plain,hashed)

def create_access_token(subject:str, expires_delta: int | None=None)->str:
    expire=datetime.now()+timedelta(minutes=(expires_delta or access_token_expiry))
    to_encode={"exp":expire, "sub":str(subject)}
    return jwt.encode(to_encode,secret_key,algorithm=algorithm)

def decode_access_token(token:str)->dict:
    return jwt.decode(token,secret_key,algorithms=[algorithm])