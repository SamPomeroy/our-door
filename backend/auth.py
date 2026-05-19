import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Literal

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

load_dotenv()

router = APIRouter()
bearer = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-prod")
ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 8

CREDENTIALS = {
    "student": "learn2024",
    "admin": "teach2024",
}


class TokenRequest(BaseModel):
    password: str
    role: Literal["student", "admin"]


class TokenResponse(BaseModel):
    access_token: str
    role: str


def create_token(role: str) -> str:
    payload = {
        "role": role,
        "jti": str(uuid.uuid4()),
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_role(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        return payload["role"]
    except (JWTError, KeyError):
        raise HTTPException(status_code=401, detail="invalid or expired token")


def get_current_jti(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        return payload["jti"]
    except (JWTError, KeyError):
        raise HTTPException(status_code=401, detail="invalid or expired token")


@router.post("/token", response_model=TokenResponse)
async def get_token(req: TokenRequest):
    if CREDENTIALS.get(req.role) != req.password:
        raise HTTPException(status_code=401, detail="invalid credentials")
    return TokenResponse(access_token=create_token(req.role), role=req.role)
