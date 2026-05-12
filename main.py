from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from conversor import convertidor_universal, suma_binaria_paso_a_paso
import os

app = FastAPI()

# Configuramos CORS
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

class SumaBinariaRequest(BaseModel):
    bin1: str
    bin2: str

# --- RUTAS DE LA API (Deben ir ANTES del mount) ---

@app.post("/convertir")
async def api_convertir(req: ConversionRequest):
    resultado = convertidor_universal(req.numero, req.base_in, req.base_out)
    if resultado is None:
        raise HTTPException(status_code=400, detail="Número o base inválida")
    return {"resultado": resultado}

@app.post("/suma-binaria")
async def api_suma_binaria(req: SumaBinariaRequest):
    try:
        if not all(c in '01' for c in req.bin1) or not all(c in '01' for c in req.bin2):
            raise HTTPException(status_code=400, detail="Dígitos inválidos")
        resultado = suma_binaria_paso_a_paso(req.bin1, req.bin2)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))