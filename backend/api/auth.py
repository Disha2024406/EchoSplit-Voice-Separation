"""Authentication endpoints (email/password + GitHub OAuth stub)."""
from fastapi import APIRouter, Depends, HTTPException

from core.database import users_col
from core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    require_user,
    verify_password,
)
from models.user import UserDoc
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


def _public(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "avatar_url": user.get("avatar_url"),
        "provider": user.get("provider", "email"),
    }


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest):
    existing = await users_col.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")
    user = UserDoc(
        email=body.email.lower(),
        name=body.name,
        password_hash=hash_password(body.password),
        provider="email",
    )
    await users_col.insert_one(user.model_dump())
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=_public(user.model_dump()))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    user = await users_col.find_one({"email": body.email.lower()}, {"_id": 0})
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"])
    return TokenResponse(access_token=token, user=_public(user))


@router.get("/me", response_model=UserPublic)
async def me(user=Depends(require_user)):
    return _public(user)


@router.get("/github/status")
async def github_status():
    """Reports whether GitHub OAuth has been configured. Credentials to be
    added by the operator in the .env (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)."""
    import os

    configured = bool(os.environ.get("GITHUB_CLIENT_ID") and os.environ.get("GITHUB_CLIENT_SECRET"))
    return {"configured": configured}
