import sys
from estaciones.estacionesOOP import EstacionesOOP

def main():
    # sys.argv[0] es el nombre del archivo. Comprobamos que haya 3 palabras en total.
    if len(sys.argv) == 3:
        tableName = sys.argv[1]
        functionName = sys.argv[2]     
    else:
        print("Error: You must give two parameters tableName and functionName to execute the addecuate function.")
        sys.exit(0)

    # 1. Cambiamos los nombres por LOS TUYOS
    if tableName not in ["estaciones", "carriles", "zonas"]:
        print("Error: The available table names are estaciones, carriles, zonas")
        sys.exit(0)
    
    # Hemos añadido selectAsTuples para que coincida con tu código y el PDF
    if functionName not in ["insert", "selectAsTuples", "selectAsDicts", "update", "delete"]:
        print("Error the available function names are insert, selectAsTuples, selectAsDicts, delete or update")
        sys.exit(0)

    # 2. Lógica para ESTACIONES
    if tableName == "estaciones":
        e = EstacionesOOP()
        
        if functionName == "insert":
            # Le pasamos un diccionario de prueba (como pide el examen)
            datos_prueba = {
                "numero": 101, "direccion": "Plaza del Ayuntamiento",
                "bicis": 15, "espacios": 5, "fecha": "2026-02-26 10:00:00",
                "lon": -0.3768, "lat": 39.4699
            }
            respuesta = e.insert(datos_prueba)
            print(respuesta) # Imprimirá el diccionario con "ok": True
            
        elif functionName == "selectAsDicts":
            respuesta = e.selectAsDicts({"id": 1})
            print(respuesta)
            
        elif functionName == "selectAsTuples":
            # Si hiciste el selectAsTuples, lo llamamos aquí
            pass
            
        elif functionName == "update":
            datos_nuevos = {
                "id": 2, # Usar el ID 2 porque el 1 lo acabo de borrar
                "bicis": 0, 
                "espacios": 20, 
                "fecha": "2026-02-26 18:30:00"
            }
            respuesta = e.update(datos_nuevos)
            print(respuesta)
            
        elif functionName == "delete":
            respuesta = e.delete({"id": 1})
            print(respuesta)

    # 3. Huecos para el futuro (carriles y zonas)
    elif tableName == "carriles":
        pass
    elif tableName == "zonas":
        pass

if __name__ == "__main__":
    main()


