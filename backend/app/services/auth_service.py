import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.schemas.auth import UserRegister

# Using bcrypt as primary with truncate_error=False to handle long passwords automatically and fast
pwd_context = CryptContext(
    schemes=["bcrypt", "pbkdf2_sha256", "bcrypt_sha256"],
    deprecated="auto",
    bcrypt__truncate_error=False
)

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
EXPIRE_MINS = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))


def hash_password(password: str) -> str:
    # passlib bcrypt handler with truncate_error=False handles the 72-byte limit
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    # passlib handles the scheme detection and automatic truncation for bcrypt
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def register_user(db: Session, data: UserRegister) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise ValueError("Email already registered")

    role = UserRole(data.role.value)
    is_verified = role == UserRole.officer

    user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=role,
        is_verified=is_verified,
        license_number=data.license_number or None,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError as exc:
        db.rollback()
        raise ValueError("Email already registered") from exc


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
