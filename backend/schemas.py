from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True



class IncidentCreate(BaseModel):
    description: str
    severity: str
    location: str
    media: Optional[str] = ""
    status: Optional[str] = "pending"

class IncidentOut(BaseModel):
    incident_id: int
    worker_id: Optional[int] = None
    description: str
    severity: str
    location: str
    media: Optional[str] = ""
    status: str
    created_at: Optional[datetime] 

    class Config:
        from_attributes = True

# class TrainingModuleOut(BaseModel):
#     module_id: int
#     title: str
#     industry: str
#     description: str
#     sop_steps: str
#     media_url: str
#     created_by: int

#     class Config:
#         from_attributes = True

class TrainingModuleCreate(BaseModel):
    title: str
    industry: str
    description: str
    sop_steps: str
    media_url: str

class TrainingModuleOut(BaseModel):
    module_id: int
    title: str
    industry: str
    description: str
    sop_steps: str
    media_url: str
    created_by: int

    class Config:
        from_attributes = True

class AssignModule(BaseModel):
    module_id: int
    user_id: int

class ModuleAssignmentOut(BaseModel):
    id: int
    module_id: int
    user_id: int

    class Config:
        from_attributes = True


class SimulationCreate(BaseModel):
    title: str
    industry: str
    scenario: str
    difficulty: str

class StepCreate(BaseModel):
    simulation_id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    correct_answer: str
    danger_level: str

class ResultCreate(BaseModel):
    simulation_id: int
    total_questions: int
    correct_answers: int
    mistakes: int
    reaction_time: float

class RiskZoneCreate(BaseModel):
    zone_name: str
    latitude: float
    longitude: float
    radius: int
    risk_level: str
    module_id: int

class RiskZoneOut(BaseModel):
    zone_id: int
    zone_name: str
    latitude: float
    longitude: float
    radius: int
    risk_level: str
    module_id: int

    class Config:
        from_attributes = True

class ZoneCheck(BaseModel):
    lat: float
    lng: float

class SOSCreate(BaseModel):
    location: str
    message: str
    emergency_type: str

class SOSOut(BaseModel):
    sos_id: int
    user_id: int
    location: str
    message: str
    emergency_type: str
    created_at: str

    class Config:
        from_attributes = True