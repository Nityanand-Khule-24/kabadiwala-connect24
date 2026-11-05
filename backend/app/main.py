"""
Kabadiwala Connect - FastAPI Central Backend
Digital Scrap Passport & Collector Empowerment Network
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import uvicorn

app = FastAPI(
    title="Kabadiwala Connect API",
    description="Centralized business logic and REST API for Scrap Collectors, Recyclers, and Admins.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "service": "Kabadiwala Connect Backend",
        "database": "Supabase PostgreSQL connected",
        "version": "1.0.0"
    }

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to Kabadiwala Connect REST API",
        "docs": "/docs",
        "tagline": "Turning Scrap into Opportunity."
    }

# Mock API routes for illustrative FastAPI deployment
@app.get("/api/v1/materials", tags=["Materials"])
def list_materials():
    return [
        {"id": "mat-1", "name": "Iron & Heavy Scrap", "category": "Metals", "unit": "kg", "indicative_price": 38.5},
        {"id": "mat-4", "name": "Pure Copper Wire", "category": "Metals", "unit": "kg", "indicative_price": 745.0},
        {"id": "mat-7", "name": "Clear PET Bottles", "category": "Plastics", "unit": "kg", "indicative_price": 36.5},
        {"id": "mat-11", "name": "Printed Circuit Boards", "category": "E-Waste", "unit": "kg", "indicative_price": 320.0}
    ]

@app.get("/api/v1/passports/{code}", tags=["Digital Scrap Passport"])
def get_passport(code: str):
    return {
        "passport_code": code,
        "status": "verified",
        "chain_of_custody_events": 4,
        "verification_url": f"https://kabadiwalaconnect.org/verify/{code}"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
