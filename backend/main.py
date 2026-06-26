

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import SessionLocal, engine, get_db
from sqlalchemy import text
from ultralytics import YOLO
from utils import distance_m
import models, schemas, auth, dependencies, shutil, json
from chatbot import get_chatbot_response
from pydantic import BaseModel
from typing import List, Dict, Optional
import os


# Create tables (Moved to startup for non-blocking init)
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Safety-Monitoring Backend")

# Lazy load heavy models
yolo_model = None
vectorstore = None

@app.on_event("startup")
async def startup_event():
    global yolo_model, vectorstore
    print("🚀 Backend starting up...")
    try:
        # Create tables if they don't exist
        models.Base.metadata.create_all(bind=engine)
        print("✅ Database tables verified.")
        
        # Load YOLO model
        yolo_model = YOLO("best.pt")
        print("✅ YOLO Model loaded.")

        # Load Chatbot Vector Store (Importing here to avoid top-level hang)
        import chatbot
        vectorstore = chatbot.get_vector_store()
        print("✅ Chatbot Vector Store loaded.")
    except Exception as e:
        print(f"❌ Startup Error: {e}")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ REGISTER
@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.hash_password(user.password)

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

# ✅ LOGIN
@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_access_token({"user_id": db_user.user_id, "role": db_user.role })

    return {
        "access_token": token,
        "token_type": "bearer"
    }

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# -------------------- CREATE INCIDENT WITH FILE UPLOAD --------------------
@app.post("/incidents/", response_model=schemas.IncidentOut)
def create_incident(
    description: str = Form(...),
    severity: str = Form(...),
    location: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    file_url = ""

    # -------------------- SAVE FILE --------------------
    if file:
        file_extension = os.path.splitext(file.filename)[1]
        file_name = f"{UPLOAD_DIR}/{file.filename}"

        with open(file_name, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_url = file_name  # store path in DB

    # -------------------- SAVE INCIDENT --------------------
    db_incident = models.Incident(
        worker_id=None,  # later replace with auth user id
        description=description,
        severity=severity,
        location=location,
        media=file_url,
        status="pending"
    )

    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    return db_incident

@app.get("/incidents/", response_model=List[schemas.IncidentOut])
def get_all_incidents(db: Session = Depends(get_db)):
    return db.query(models.Incident).order_by(models.Incident.created_at.desc()).all()

@app.get("/incidents/{incident_id}", response_model=schemas.IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.incident_id == incident_id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    return incident

@app.put("/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    status: str,
    reviewed_by: int,
    db: Session = Depends(get_db)
):
    incident = db.query(models.Incident).filter(models.Incident.incident_id == incident_id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = status
    incident.reviewed_by = reviewed_by

    db.commit()
    db.refresh(incident)

    return {"message": "Incident updated successfully", "incident": incident}

@app.post("/modules")
def create_module(
    module: schemas.TrainingModuleCreate,
    db: Session = Depends(get_db),
    user=Depends(dependencies.require_role("admin"))  # 🔥 only admin
):
    new_module = models.TrainingModule(
        title=module.title,
        industry=module.industry,
        description=module.description,
        sop_steps=module.sop_steps,
        media_url=module.media_url,
        created_by=user["user_id"]
    )

    db.add(new_module)
    db.commit()
    db.refresh(new_module)

    return new_module

@app.get("/modules", response_model=list[schemas.TrainingModuleOut])
def get_modules(
    db: Session = Depends(get_db),
    user=Depends(dependencies.require_role("admin"))
):
    return db.query(models.TrainingModule).all()

@app.post("/assign-module")
def assign_module(
    module_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(dependencies.require_role("admin"))
):
    # ✅ Check user exists and is worker
    target_user = db.query(models.User).filter_by(user_id=user_id).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.role != "worker":
        raise HTTPException(status_code=400, detail="Can only assign to workers")

    assignment = models.ModuleAssignment(
        module_id=module_id,
        user_id=user_id
    )

    db.add(assignment)
    db.commit()

    return {"message": "Module assigned successfully"}

@app.get("/my-modules")
def get_my_modules(
    db: Session = Depends(get_db),
    user=Depends(dependencies.require_role("worker"))
):
    modules = db.query(models.TrainingModule).join(
        models.ModuleAssignment,
        models.ModuleAssignment.module_id == models.TrainingModule.module_id
    ).filter(
        models.ModuleAssignment.user_id == user["user_id"]
    ).all()

    return modules

@app.post("/admin/assign-module/{module_id}/{user_id}")
def assign_module(
    module_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(dependencies.require_role("admin"))
):
    # check if user is worker
    user = db.query(models.User).filter(models.User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role != "worker":
        raise HTTPException(status_code=400, detail="Only workers can be assigned modules")

    assignment = models.ModuleAssignment(
        module_id=module_id,
        user_id=user_id
    )

    db.add(assignment)
    db.commit()

    return {"message": "Module assigned successfully"}

@app.get("/admin/users")
def get_workers(
    db: Session = Depends(get_db),
    admin=Depends(dependencies.require_role("admin"))
):
    return db.query(models.User).filter(models.User.role == "worker").all()


@app.post("/sos")
def send_sos(
    data: schemas.SOSCreate,
    db: Session = Depends(get_db),
    user=Depends(dependencies.get_current_user)
):
    sos = models.SOSAlert(
        user_id=user["user_id"],
        location=data.location,
        message=data.message,
        emergency_type=data.emergency_type
    )

    db.add(sos)
    db.commit()

    # 🔥 Find relevant training module
    module = db.query(models.TrainingModule).filter(
        models.TrainingModule.title.ilike(f"%{data.emergency_type}%")
    ).first()

    recommended_module = "General Safety SOP"
    sop = "Follow general safety protocol and wait for rescue team."

    if module:
        recommended_module = module.title
        sop = module.sop_steps
    else:
        # AI Fallback: Get 3 clear steps from the chatbot/manuals
        try:
            ai_advice = get_chatbot_response(f"Provide exactly 3 concise and clear emergency safety steps for a {data.emergency_type} emergency incident. Focus on immediate survival steps.")
            recommended_module = f"{data.emergency_type} Safety (AI Guide)"
            sop = ai_advice
        except:
            pass

    return {
        "msg": "SOS sent successfully",
        "recommended_module": recommended_module,
        "sop": sop
    }

@app.get("/sos-alerts")
def get_sos_alerts(
    db: Session = Depends(get_db),
    user=Depends(dependencies.require_role("officer"))
):
    alerts = db.query(
        models.SOSAlert.sos_id,
        models.SOSAlert.location,
        models.SOSAlert.message,
        models.SOSAlert.emergency_type,
        models.SOSAlert.created_at,
        models.User.name.label("worker_name")
    ).join(
        models.User,
        models.SOSAlert.user_id == models.User.user_id
    ).order_by(
        models.SOSAlert.created_at.desc()
    ).all()

    result = []

    for a in alerts:
        result.append({
            "sos_id": a.sos_id,
            "worker_name": a.worker_name,
            "location": a.location,
            "message": a.message,
            "emergency_type": a.emergency_type,
            "time": str(a.created_at)
        })

    return result

@app.post("/simulations")
def create_sim(data: schemas.SimulationCreate,
db: Session = Depends(get_db),
user=Depends(dependencies.require_role("admin"))):

    sim = models.Simulation(**data.dict())
    db.add(sim)
    db.commit()
    return {"message":"Created"}
@app.post("/simulation-step")
def add_step(data: schemas.StepCreate,
db: Session = Depends(get_db),
user=Depends(dependencies.require_role("admin"))):

    step = models.SimulationStep(**data.dict())
    db.add(step)
    db.commit()
    return {"message":"Step Added"}
@app.get("/simulations")
def get_all(db: Session = Depends(get_db)):
    return db.query(models.Simulation).all()
@app.get("/simulation/{simulation_id}")
def get_steps(simulation_id:int, db:Session=Depends(get_db)):
    return db.query(models.SimulationStep).filter(
        models.SimulationStep.simulation_id == simulation_id
    ).all()
@app.post("/submit-result")
def submit_result(data: schemas.ResultCreate,
db: Session = Depends(get_db),
user=Depends(dependencies.get_current_user)):

    accuracy = (data.correct_answers / data.total_questions) * 70
    speed = max(0, 20 - data.reaction_time)
    penalty = data.mistakes * 10

    score = accuracy + speed - penalty

    result = models.SimulationResult(
        user_id=user["user_id"],
        simulation_id=data.simulation_id,
        total_questions=data.total_questions,
        correct_answers=data.correct_answers,
        mistakes=data.mistakes,
        reaction_time=data.reaction_time,
        score=score
    )

    db.add(result)
    db.commit()

    return {"score": score}
@app.get("/analytics")
def analytics(db:Session=Depends(get_db)):
    return db.query(models.SimulationResult).all()

@app.get("/officer/analytics")
def officer_analytics(
    db: Session = Depends(get_db),
    user=Depends(dependencies.require_role("officer"))
):
    data = db.execute(text("""
    SELECT
        sr.result_id,
        sr.user_id,
        u.name,
        sr.simulation_id,
        s.title,
        sr.total_questions,
        sr.correct_answers,
        sr.mistakes,
        sr.reaction_time,
        sr.score
    FROM simulation_results sr
    JOIN users u ON sr.user_id = u.user_id
    JOIN simulations s ON sr.simulation_id = s.simulation_id
    ORDER BY sr.result_id DESC
""")).fetchall()

    return [dict(row._mapping) for row in data]

@app.post("/zones")
def create_zone(
    zone: schemas.RiskZoneCreate,
    db: Session = Depends(get_db),
    user=Depends(dependencies.require_role("admin"))
):
    new_zone = models.RiskZone(**zone.dict())
    db.add(new_zone)
    db.commit()
    db.refresh(new_zone)
    return new_zone

@app.get("/zones", response_model=list[schemas.RiskZoneOut])
def get_zones(db: Session = Depends(get_db)):
    return db.query(models.RiskZone).all()

@app.post("/user/check-zone")
def check_zone(
    lat: float,
    lng: float,
    db: Session = Depends(get_db),
    user=Depends(dependencies.require_role("worker"))
):
    zones = db.query(models.RiskZone).all()

    for zone in zones:
        dist = distance_m(lat, lng, zone.latitude, zone.longitude)

        if dist <= zone.radius:
            module = db.query(models.TrainingModule).filter(
                models.TrainingModule.module_id == zone.module_id
            ).first()

            return {
                "inside_zone": True,
                "zone": zone.zone_name,
                "risk_level": zone.risk_level,
                "alert": "Danger! You entered high-risk zone.",
                "module": module.title if module else None
            }

    return {"inside_zone": False}

model = YOLO("best.pt")
@app.post("/detect-ppe")
async def detect(file: UploadFile = File(...)):
    print(file.filename)
    path = "temp.jpg"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Increase accuracy with proper image size and confidence threshold
    results = model(path, imgsz=640, conf=0.3)

    detections = []

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])

            detections.append({
                "label": model.names[cls],
                "confidence": round(conf,2)
            })

    return {"detections": detections}

@app.get("/profile")
def get_profile(user=Depends(dependencies.get_current_user)):
    return {"user": user}
@app.get("/officer/dashboard")
def officer_dashboard(user=Depends(dependencies.require_role("officer"))):
    return {"message": "Welcome Safety Officer"}
@app.get("/admin/dashboard")
def admin_dashboard(user=Depends(dependencies.require_role("admin"))):
    return {"message": "Welcome Admin"}
@app.put("/admin/change-role/{user_id}")
def change_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    user=Depends(dependencies.require_role("admin"))
):

    # ✅ Validate role
    allowed_roles = ["officer", "admin"]
    if new_role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")

    target_user = db.query(models.User).filter(models.User.user_id == user_id).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.role = new_role
    db.commit()

    return {"message": f"Role updated to {new_role}"}
@app.get("/admin/users")
def get_users(
    db: Session = Depends(get_db),
    user=Depends(dependencies.require_role("admin"))
):
    users = db.query(models.User).all()
    return users


# @app.post("/incidents", response_model=schemas.IncidentOut)
# def create_incident(
#     incident: schemas.IncidentCreate,
#     db: Session = Depends(get_db),
#     user=Depends(dependencies.require_role("worker"))
# ):
#     new_incident = models.Incident(
#         worker_id=user["user_id"],
#         description=incident.description,
#         severity=incident.severity,
#         location=incident.location,
#         media=incident.media,
#         status="pending"
#     )
#     db.add(new_incident)
#     db.commit()
#     db.refresh(new_incident)
#     return new_incident

# @app.get("/incidents", response_model=list[schemas.IncidentOut])
# def get_incidents(db: Session = Depends(get_db), user=Depends(dependencies.require_role("officer"))):
#     return db.query(models.Incident).order_by(models.Incident.created_at.desc()).all()

# @app.put("/incidents/{incident_id}/status")
# def update_status(
#     incident_id: int,
#     status: str,
#     db: Session = Depends(get_db),
#     user=Depends(dependencies.require_role("officer"))
# ):
#     incident = db.query(models.Incident).filter(models.Incident.incident_id == incident_id).first()

#     if not incident:
#         raise HTTPException(status_code=404, detail="Not found")

#     incident.status = status
#     db.commit()

#     return {"message": "Updated"}

class ChatMessage(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    question: str
    chat_history: List[Dict[str, str]] = []

@app.post("/ask")
def ask_chatbot_api(request: ChatRequest):
    from chatbot import get_chatbot_response
    try:
        answer = get_chatbot_response(request.question, request.chat_history)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def home():
    return {"message": "Backend running!"}

@app.get("/hello")
def hello():
    return {"message": "Hello from backend!"}
