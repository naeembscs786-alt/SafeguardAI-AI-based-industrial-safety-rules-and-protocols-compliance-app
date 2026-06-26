from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "f9b52fb084a347835aad808f458a864f46a85e03b747c933cc9ffe6f49ef0f59"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 🔐 Hash password
def hash_password(password: str):
    return pwd_context.hash(password)

# 🔐 Verify password
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# 🔐 Create JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)