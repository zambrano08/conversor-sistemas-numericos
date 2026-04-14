# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from conversor import convertidor_universal # Importamos tu código

app = FastAPI()

# Configuramos CORS para que tu app de Next.js pueda comunicarse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConversionRequest(BaseModel):
    numero: str
    base_in: int
    base_out: int

@app.post("/convertir")
async def api_convertir(req: ConversionRequest):
    resultado = convertidor_universal(req.numero, req.base_in, req.base_out)
    
    if resultado is None:
        raise HTTPException(status_code=400, detail="Número o base inválida")
        
    return {"resultado": resultado}