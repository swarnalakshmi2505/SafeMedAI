from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base
import enum


class UserRole(str, enum.Enum):
    officer = "officer"
    doctor = "doctor"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)

    # Doctor-specific
    is_verified = Column(Boolean, default=False)
    license_number = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    downloads = relationship("DownloadHistory", back_populates="user")


class DownloadHistory(Base):
    __tablename__ = "download_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    drug_name = Column(String, nullable=False)
    report_type = Column(String, default="PDF Analysis")
    downloaded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="downloads")

