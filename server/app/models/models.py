from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from app.db.pg import Base
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY

from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.dialects.postgresql import ARRAY

class User(Base):
    __tablename__='users'
    id=Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    username=Column(String, unique=True, index=True)
    password=Column(String)
    email=Column(String, unique=True, index=True, nullable=True)
    fullname=Column(String, index=True, nullable=True)
    authenticated=Column(Boolean,default=False)

    contents=relationship('Content', back_populates='user', cascade="all, delete-orphan")


class Content(Base):
    __tablename__='contents'
    id=Column(String, primary_key=True, index=True, default=lambda:str(uuid.uuid4()))
    url=Column(String)
    description=Column(String,nullable=True)
    color=Column(String)
    timestamp = Column(Integer, default=lambda: int(datetime.now().timestamp()))
    tags = Column(ARRAY(String),default=list)

    children_ids = Column(MutableList.as_mutable(ARRAY(String)), default=[])    

    username=Column(String, ForeignKey('users.username'))
    user=relationship('User', back_populates='contents')

class Tag(Base):
    __tablename__='tags'
    id=Column(String, primary_key=True, index=True, default= lambda: str(uuid.uuid4()))
    tagname=Column(String, unique=True, index=True)
    count=Column(Integer, index=True, default=1)