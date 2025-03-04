from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import video_routes, image_routes, image_ht

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(video_routes.router, prefix="/video")
app.include_router(image_routes.router, prefix="/image")
app.include_router(image_ht.router, prefix="/image-ht",)
