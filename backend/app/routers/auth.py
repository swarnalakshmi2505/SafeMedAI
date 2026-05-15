from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut
from app.services.auth_service import (
    register_user, authenticate_user, create_access_token, decode_token
)
from app.models.user import User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    print(f"--- REGISTER ATTEMPT: {data.email} ---")
    try:
        user = register_user(db, data)
        print(f"--- REGISTER SUCCESS: {data.email} ---")
        return user
    except ValueError as e:
        print(f"--- REGISTER FAILED: {data.email} - {str(e)} ---")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    print(f"--- LOGIN ATTEMPT: {data.email} ---")
    user = authenticate_user(db, data.email, data.password)
    if not user:
        print(f"--- LOGIN FAILED (Invalid creds): {data.email} ---")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    print(f"--- LOGIN SUCCESS: {data.email} ---")
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        role=user.role.value,
        full_name=user.full_name,
        is_verified=user.is_verified
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_officer(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "officer":
        raise HTTPException(status_code=403, detail="Officer access required")
    return current_user


def require_doctor(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")
    return current_user


@router.get("/unverified-doctors", response_model=list[UserOut])
def get_unverified_doctors(
    db: Session = Depends(get_db),
    _: User = Depends(require_officer)
):
    return db.query(User).filter(User.role == UserRole.doctor, User.is_verified == False).all()


@router.patch("/verify-doctor/{doctor_id}", response_model=UserOut)
def verify_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_officer)
):
    doctor = db.query(User).filter(User.id == doctor_id, User.role == UserRole.doctor).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.is_verified = True
    db.commit()
    db.refresh(doctor)
    return doctor


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
