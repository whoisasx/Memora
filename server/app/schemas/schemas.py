from pydantic import BaseModel, EmailStr,HttpUrl, field_validator
from typing import List, Optional

class UserBase(BaseModel):
    username:str
    fullname:Optional[str]=None
    email: Optional[EmailStr]=None
    authenticated: Optional[bool]=None

class UserInDB(UserBase):
    hashed_password: str

class UserIn(UserBase):
    password: str

class UserOut(UserBase):
    pass


class ContentBase(BaseModel):
    id:str
    url:str
    description:Optional[str]=None
    color:str
    timestamp:Optional[int]=None
    tags:List[str]=[]

class UrlBase(BaseModel):
    domain:str
    favicon:Optional[str]=None
    title:Optional[str]=None
    url_description:Optional[str]=None
    thumbnail:Optional[str]=None
    site_name:str
class ContentInDB(ContentBase):
    domain:str
    favicon:Optional[str]=None
    title:Optional[str]=None
    url_description:Optional[str]=None
    thumbnail:Optional[str]=None
    site_name:str
    user_id:str

class ContentIn(ContentBase):
    pass
class ContentOut(ContentBase):
    pass

class Embeddings(BaseModel):
    vector: List[float]

    @field_validator("vector")
    def check_embedding_dims(cls,v):
        from os import getenv
        dims=getenv('EMBEDDING_DIMS')
        try:
            expected=int(dims) if dims is not None else None
        except ValueError:
            expected=None
        if expected is not None and len(v)!=expected:
            raise ValueError(f"embedding vector must have length {expected}, got {len(v)}")
        return v;

class ContentInES(BaseModel):
    id: str
    url: str
    description: Optional[str]=None
    embeddings: Embeddings


class TagBase(BaseModel):
    tagname:str
    count: int = 1