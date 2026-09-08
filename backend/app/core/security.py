from datetime import datetime, timedelta, timezone

from typing import Optional



import bcrypt

from jose import JWTError, jwt

from fastapi import Depends, HTTPException, status

from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer



from app.core.config import settings



security = HTTPBearer(auto_error=False)



ROLE_PERMISSIONS = {

    "ADMIN": {"*"},

    "COMMANDER": {"incidents:*", "cameras:read", "social:*", "dispatch:*", "alerts:*", "simulation:*"},

    "POLICE": {"incidents:read", "incidents:update", "cameras:read", "dispatch:confirm", "alerts:read"},

    "MEDICAL": {"incidents:read", "incidents:update", "dispatch:confirm", "alerts:read", "shelters:read"},

    "ANALYST": {"incidents:*", "cameras:read", "social:*", "verification:*", "predictions:read"},

    "VIEWER": {"incidents:read", "cameras:read", "social:read", "alerts:read", "shelters:read"},

}





def hash_password(password: str) -> str:

    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")





def verify_password(plain: str, hashed: str) -> bool:

    try:

        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

    except Exception:

        return False





def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:

    expire = datetime.now(timezone.utc) + (

        expires_delta or timedelta(minutes=settings.jwt_expire_minutes)

    )

    payload = {"sub": subject, "role": role, "exp": expire}

    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)





def decode_token(token: str) -> dict:

    try:

        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])

    except JWTError as exc:

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc





async def get_current_user(

    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),

) -> dict:

    if credentials is None:

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_token(credentials.credentials)

    return {"id": payload["sub"], "role": payload.get("role", "VIEWER")}





def require_role(*allowed_roles: str):

    async def checker(user: dict = Depends(get_current_user)) -> dict:

        if user["role"] not in allowed_roles and "ADMIN" not in allowed_roles:

            if user["role"] != "ADMIN" and user["role"] not in allowed_roles:

                raise HTTPException(status_code=403, detail="Insufficient permissions")

        return user



    return checker

