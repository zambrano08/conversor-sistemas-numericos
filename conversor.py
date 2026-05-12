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

def suma_binaria_paso_a_paso(bin1, bin2):
    """
    Realiza suma binaria con detalles paso a paso.
    Retorna un diccionario con los acarreos, números alineados y resultado.
    """
    # Alineamos los números a la misma longitud añadiendo ceros a la izquierda
    max_len = max(len(bin1), len(bin2))
    bin1 = bin1.zfill(max_len)
    bin2 = bin2.zfill(max_len)
    
    carreo = 0
    lista_carreos = []
    resultado = ""

    # Recorremos de derecha a izquierda
    for i in range(max_len - 1, -1, -1):
        bit1 = int(bin1[i])
        bit2 = int(bin2[i])
        
        suma = bit1 + bit2 + carreo
        
        # Determinamos el bit del resultado y el nuevo acarreo
        if suma == 0:
            resultado = "0" + resultado
            carreo = 0
        elif suma == 1:
            resultado = "1" + resultado
            carreo = 0
        elif suma == 2:
            resultado = "0" + resultado
            carreo = 1
        elif suma == 3:
            resultado = "1" + resultado
            carreo = 1
            
        lista_carreos.insert(0, str(carreo))

    # El último acarreo se agrega al final si es 1
    if carreo == 1:
        resultado = "1" + resultado
        # Ajustamos los espacios para la visualización
        final_carreos = "1" + "".join(lista_carreos[:-1])
    else:
        final_carreos = " " + "".join(lista_carreos[:-1])

    return {
        "carreos": final_carreos,
        "n1": bin1.rjust(len(resultado)),
        "n2": bin2.rjust(len(resultado)),
        "res": resultado
    }