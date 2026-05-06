# APIs and FastAPI

## What is an API?

An API (Application Programming Interface) is a way for two programs to talk to each other. A REST API uses HTTP requests to send and receive data, usually as JSON.

Think of it like a restaurant: you (the client) order from a menu (the API), the kitchen (the server) does the work, and the waiter (HTTP) brings back what you asked for.

## HTTP Methods

| Method | Purpose | Example |
|---|---|---|
| GET | Read data | Get a list of users |
| POST | Create new data | Submit a new user |
| PUT | Replace existing data | Update a whole user record |
| PATCH | Partially update data | Update just a user's email |
| DELETE | Delete data | Remove a user |

## HTTP Status Codes

- **200** OK -- success
- **201** Created -- resource was created (POST success)
- **400** Bad Request -- client sent bad data
- **401** Unauthorized -- not logged in
- **403** Forbidden -- logged in but not allowed
- **404** Not Found -- resource doesn't exist
- **422** Unprocessable Entity -- validation error (FastAPI uses this a lot)
- **500** Internal Server Error -- something broke on the server

## What is FastAPI?

FastAPI is a Python web framework for building APIs. It's fast, modern, and generates automatic documentation.

```bash
pip install fastapi uvicorn
```

## Basic FastAPI App

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "hello world"}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id}
```

Run it:
```bash
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` for auto-generated interactive docs.

## Request Bodies with Pydantic

FastAPI uses Pydantic models to validate incoming data:

```python
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int
    email: str

@app.post("/users")
def create_user(user: User):
    # user.name, user.age, user.email are all validated
    return {"created": user.name}
```

If the request body is missing a field or has the wrong type, FastAPI returns a 422 automatically.

## Query Parameters

```python
@app.get("/items")
def get_items(skip: int = 0, limit: int = 10):
    # GET /items?skip=0&limit=10
    return {"skip": skip, "limit": limit}
```

## Authentication with JWT

JWT (JSON Web Token) is a common way to handle auth in APIs. After login, the server issues a token. The client sends it in future requests as a Bearer token in the Authorization header.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Dependencies (Depends)

FastAPI's `Depends` system lets you reuse logic across routes:

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

def get_current_user(credentials = Depends(security)):
    # validate token, return user info
    ...

@app.get("/protected")
def protected_route(user = Depends(get_current_user)):
    return {"user": user}
```

## CORS

When your frontend (running on port 5173) calls your backend (running on port 8000), the browser blocks it by default. Add CORS middleware:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Common Mistakes

- Running `python main.py` instead of `uvicorn main:app --reload`
- Forgetting `async` on async route handlers (or adding it when you don't need it)
- Not handling 422 validation errors gracefully in the frontend
- Sending JSON without `Content-Type: application/json` header in fetch/axios
- CORS errors because the origin list doesn't exactly match the frontend URL
