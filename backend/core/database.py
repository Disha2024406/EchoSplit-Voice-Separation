"""MongoDB async client (Motor)."""
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.DB_NAME]

users_col = db["users"]
jobs_col = db["jobs"]


async def ensure_indexes() -> None:
    await users_col.create_index("email", unique=True)
    await jobs_col.create_index([("owner_id", 1), ("created_at", -1)])
    await jobs_col.create_index("guest_token")
