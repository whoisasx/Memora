from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path,status
from typing import Annotated
from app.schemas.schemas import TagBase
from app.db.pg import get_db
from sqlalchemy.orm import Session
from app.models.models import Tag

router=APIRouter(
    prefix='/tags',
    tags=['tags'],
    dependencies=[Depends(get_db)],
    responses={404:{"description":"not-found"}}
)

@router.get('/')
def get_tags(db:Session=Depends(get_db)):
    try:
        all_tags=db.query(Tag).all()
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while getting tags.")
    return{
        "message":"tags fetched.",
        "success":True,
        "tags":all_tags
    }
