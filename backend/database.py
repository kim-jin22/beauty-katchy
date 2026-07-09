# sqlalchemy : db와 python 연결해주는 라이브러리
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 어느 db에 연결할지 환경변수(.env)에서 읽어옴
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL 환경변수가 설정되지 않았습니다. "
        ".env 파일에 DATABASE_URL=postgresql://user:password@host:port/dbname 형태로 추가하세요."
    )

# 이 engine은 models.py에서 테이블 생성
engine = create_engine(DATABASE_URL)
# 실제 쿼리를 날릴 때 쓸 세션 객체를 만들어줌 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
