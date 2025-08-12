import os
from urllib.parse import quote_plus
from dotenv import load_dotenv


load_dotenv()


class Config:
    DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"
    SECRET_KEY = os.environ.get("SECRET_KEY", os.urandom(32))

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    # Allow DATABASE_URL override; else build from components
    DATABASE_URL = os.environ.get("DATABASE_URL")

    DB_USER = os.environ.get("DB_USER", "root")
    DB_PASS = os.environ.get("DB_PASS", "")
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = int(os.environ.get("DB_PORT", "3306"))
    DB_NAME = os.environ.get("DB_NAME", "crediease")

    @staticmethod
    def build_mysql_uri(user: str, password: str, host: str, port: int, database: str) -> str:
        return (
            f"mysql+pymysql://{quote_plus(user)}:{quote_plus(password)}@{host}:{port}/{quote_plus(database)}"
        )

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # Normalize accidental formats like "2002@localhost" into host+port
        host = self.DB_HOST
        port = self.DB_PORT
        if "@" in host:
            left, right = host.split("@", 1)
            if left.isdigit():
                port = int(left)
                host = right
        return self.build_mysql_uri(self.DB_USER, self.DB_PASS, host, port, self.DB_NAME)


