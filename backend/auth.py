from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal

router = APIRouter()

HARDCODED_PASSWORD = "test"


class TokenRequest(BaseModel):
    password: str
    role: Literal["student", "admin"]


class TokenResponse(BaseModel):
    access_token: str
    role: str


@router.post("/token", response_model=TokenResponse)
async def get_token(req: TokenRequest):
    if req.password != HARDCODED_PASSWORD:
        raise HTTPException(status_code=401, detail="invalid password")
    return TokenResponse(
        access_token=f"placeholder-token-{req.role}",
        role=req.role,
    )
