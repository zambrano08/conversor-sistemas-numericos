# logic.py
def convertir_a_decimal(numero_str, base): 
    return int(numero_str, base)

def decimal_a_base_n(numero_decimal, base_destino):
    if numero_decimal == 0:
        return "0"
    
    digitos = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    resultado = ""
    
    while numero_decimal > 0:
        residuo = numero_decimal % base_destino
        resultado = digitos[residuo] + resultado
        numero_decimal //= base_destino
        
    return resultado

def convertidor_universal(numero, base_in, base_out):
    try:
        decimal = convertir_a_decimal(numero, base_in)
        return decimal_a_base_n(decimal, base_out)
    except ValueError:
        return None