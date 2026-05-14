import os
import tempfile

os.environ.setdefault("MOCK_MODE", "true")
os.environ.setdefault("OPENAI_API_KEY", "mock-key")
os.environ.setdefault("SECRET_KEY", "test-secret")

import main

# use a temp db so tests don't touch the real logs.db
main.DB_PATH = tempfile.mktemp(suffix=".db")
main.init_db()
