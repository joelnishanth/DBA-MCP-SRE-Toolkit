from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import uvicorn
from .synthetic_data_generator import SyntheticDataGenerator
from .chat_service import ChatService
from . import endpoints

app = FastAPI(title="AWS Inventory Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize synthetic data generator
data_generator = SyntheticDataGenerator()
chat_service = ChatService()

# Set the global instances in endpoints
endpoints.data_generator = data_generator
endpoints.chat_service = chat_service

# Include API routes
app.include_router(endpoints.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "aws-inventory-service"}

@app.post("/initialize-data")
async def initialize_data_endpoint():
    """Manually initialize synthetic data"""
    print("Manually initializing synthetic data...")
    data_generator.initialize_data()
    return {
        "status": "success", 
        "ec2_instances": len(data_generator.ec2_instances),
        "rds_instances": len(data_generator.rds_instances),
        "databases": len(data_generator.databases),
        "cost_records": len(data_generator.cost_data)
    }

@app.on_event("startup")
async def startup_event():
    """Generate synthetic data on startup"""
    print("Initializing synthetic data...")
    try:
        data_generator.initialize_data()
        print("Synthetic data initialization complete!")
        print(f"Generated: {len(data_generator.ec2_instances)} EC2, {len(data_generator.rds_instances)} RDS, {len(data_generator.databases)} DBs, {len(data_generator.cost_data)} cost records")
    except Exception as e:
        print(f"Error initializing data: {e}")

# Initialize data immediately when module loads
print("Module loading - initializing data...")
data_generator.initialize_data()
print("Module data initialization complete!")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5002)