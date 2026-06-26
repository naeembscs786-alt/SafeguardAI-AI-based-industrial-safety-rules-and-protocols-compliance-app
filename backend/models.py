from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, TIMESTAMP
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(Text, nullable=False)
    role = Column(String(50))
    created_at = Column(TIMESTAMP, server_default=func.now())

class Incident(Base):
    __tablename__ = "incidents"

    incident_id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("users.user_id"))

    description = Column(Text)
    severity = Column(String(50))
    location = Column(Text)
    media = Column(Text)

    status = Column(String(50), default="pending")
    reviewed_by = Column(Integer, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())

class TrainingModule(Base):
    __tablename__ = "training_modules"

    module_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    industry = Column(String(100))
    description = Column(Text)
    sop_steps = Column(Text)
    media_url = Column(Text)

    # 🔥 linked to users table
    created_by = Column(Integer, ForeignKey("users.user_id"))


class ModuleAssignment(Base):
    __tablename__ = "module_assignments"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("training_modules.module_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))


class SOSAlert(Base):
    __tablename__ = "sos_alerts"

    sos_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    location = Column(String)
    message = Column(String)
    emergency_type = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())

# class TrainingModule(Base):
#     __tablename__ = "training_modules"

#     module_id = Column(Integer, primary_key=True, index=True)
#     title = Column(String(100))
#     industry = Column(String(100))
#     description = Column(Text)
#     sop_steps = Column(Text)
#     media_url = Column(Text)
#     created_by = Column(Integer, ForeignKey("users.user_id"))

class Simulation(Base):
    __tablename__ = "simulations"

    simulation_id = Column(Integer, primary_key=True)
    title = Column(String)
    industry = Column(String)
    scenario = Column(Text)
    difficulty = Column(String)


class SimulationStep(Base):
    __tablename__ = "simulation_steps"

    step_id = Column(Integer, primary_key=True)
    simulation_id = Column(Integer, ForeignKey("simulations.simulation_id"))
    question = Column(Text)
    option_a = Column(Text)
    option_b = Column(Text)
    option_c = Column(Text)
    correct_answer = Column(String)
    danger_level = Column(String)


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    result_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    simulation_id = Column(Integer)
    total_questions = Column(Integer)
    correct_answers = Column(Integer)
    mistakes = Column(Integer)
    reaction_time = Column(Float)
    score = Column(Float)

class RiskZone(Base):
    __tablename__ = "risk_zones"

    zone_id = Column(Integer, primary_key=True)
    zone_name = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    radius = Column(Float)
    risk_level = Column(String(50))
    module_id = Column(Integer, ForeignKey("training_modules.module_id"))