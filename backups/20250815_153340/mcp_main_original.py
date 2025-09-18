from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints import router

app = FastAPI(title="MCP Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)