from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path,status
from typing import Annotated,Optional
from app.schemas.schemas import TagBase
from app.db.pg import get_db
from sqlalchemy.orm import Session
from app.models.models import Tag
from pydantic import BaseModel

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

class Payload(BaseModel):
    tagname:str

@router.post('/search')
def search_tags(payload:Annotated[Payload,Body()], db: Session = Depends(get_db)):
    try:
        if not payload:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="tagname is required in body")

        # case-insensitive substring match
        matching_tags = db.query(Tag).filter(Tag.tagname.ilike(f"%{payload}%")).all()
    except HTTPException:
        raise
    except Exception as e:
        print("error: ", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while searching tags.")

    return {
        "message": "tags search results.",
        "success": True,
        "tags": matching_tags
    }
