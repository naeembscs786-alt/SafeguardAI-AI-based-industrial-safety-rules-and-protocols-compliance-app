# from transformers import pipeline

# pipe = pipeline(
#     "object-detection",
#     model="Dricz/ppe-obj-detection"
# )

# results = pipe("D:/My-FYP/AiSafetyComplianceApp/my-app/backend/test.jpg")

# filtered = [x for x in results if x["score"] > 0.5]

# print(filtered)

from ultralytics import YOLO

model = YOLO("best.pt")
results = model("test2.jpg", save=True)

print("Working")

# from ultralytics import YOLO

# model = YOLO("best.pt")
# print(model.names)