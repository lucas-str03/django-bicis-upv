import sys
from estaciones.estacionesOOP import EstacionesOOP
from carriles.carrilesOOP import CarrilesOOP
from barrios.barriosOOP import BarriosOOP

# Sys para cuadno escribimos en la terminal, pa posicion 0 es el nombre del arhivo (mainOOP) 
def main():
    if len(sys.argv) == 3:
        tableName = sys.argv[1] # Estaciones, carriles o Barrios 
        functionName = sys.argv[2]  # CRUD,...
    else:
        print("Error: You must give two parameters tableName and functionName to execute the addecuate function.")
        sys.exit(0)

    if tableName not in ["estaciones", "carriles", "zonas"]:
        print("Error: The available table names are estaciones, carriles, zonas")
        sys.exit(0)
    
    if functionName not in ["insert", "selectAsTuples", "selectAsDicts", "update", "delete"]:
        print("Error the available function names are insert, selectAsTuples, selectAsDicts, delete or update")
        sys.exit(0)

    # ==========================================
    # 1. Lógica para ESTACIONES (Puntos)
    # ==========================================
    if tableName == "estaciones":
        e = EstacionesOOP() # Python va a EstacionesOOP, ejecuta el __init__ y guarda la conexión lista para usarse dentro de la letra e.
        
        if functionName == "insert":
            #  DATOS REALES DE FERNANDO EL CATÓLICO
            datos_prueba = {
                "numero": 100, 
                "direccion": "Estacion Prueba",
                "activo": "T",
                "bicis": 13, 
                "espacios_libres": 6, 
                "espacios_totales": 20,
                "fecha": "2026-02-27 20:49:49",
                "lon": -3.7000, 
                "lat": 40.4000
            }
            print(e.insert(datos_prueba)) 
            
        elif functionName == "selectAsDicts":
            print(e.selectAsDicts({"id": 1}))
            
        elif functionName == "selectAsTuples":
            print(e.selectAsTuples({"id": 1}))
            
        elif functionName == "update":
            # 🚲 DATOS ACTUALIZADOS
            datos_nuevos = {
                "id": 1, 
                "activo": "T",
                "bicis": 10, 
                "espacios_libres": 10, 
                "fecha": "2026-02-27 21:00:00",
                "lon": -0.3768, 
                "lat": 39.4699
            }
            print(e.update(datos_nuevos))
            
        elif functionName == "delete":
            print(e.delete({"id": 1})) # IMPORTANTE, si hago insert y luego borro. Cambiar el id por el que me ha dado el neuvo insert

    # ==========================================
    # 2. Lógica para CARRILES (Líneas)
    # ==========================================
    elif tableName == "carriles":
        c = CarrilesOOP()
        
        if functionName == "insert":
            datos_carril = {
                "objectid": 9999,
                "tipo": "Ciclocalle",
                "longitud": 150.5,
                "fecha": "2026-02-27 10:00:00",
                "geometria_wkt": "LINESTRING(1.1 39.1, 1.2 39.2)" 
            }
            print("Insertando Carril de prueba...")
            print(c.insert(datos_carril))
            
        elif functionName == "selectAsDicts":
            print(c.selectAsDicts({"id": 1}))
            
        elif functionName == "selectAsTuples":
            print(c.selectAsTuples({"id": 1}))
            
        elif functionName == "update":
            datos_actualizados = {
                "id": 1, 
                "tipo": "Carril Bici Segregado", 
                "longitud": 150.5, 
                "fecha": "2026-02-27 11:30:00",
                "geometria_wkt": "LINESTRING(-0.3732 39.4683, -0.3689 39.4701)"
            }
            print(c.update(datos_actualizados))
            
        elif functionName == "delete":
            print(c.delete({"id": 1}))

    # ==========================================
    # 3. Lógica para ZONAS/BARRIOS (Polígonos)
    # ==========================================
    elif tableName == "zonas":
        z = BarriosOOP()
        
        if functionName == "insert":
            datos_barrio = {
                "codigo_distrito_barrio": 999,
                "nombre": "Prueba",
                "codigo_distrito": 19,
                "codigo_barrio": 5,
                "area": 1500.50,
                "geometria_wkt": "POLYGON((1.0 39.0, 2.0 39.0, 2.0 40.0, 1.0 40.0, 1.0 39.0))"
            }
            print("Insertando Barrio de prueba...")
            print(z.insert(datos_barrio))
            
        elif functionName == "selectAsDicts":
            print(z.selectAsDicts({"id": 1}))
            
        elif functionName == "selectAsTuples":
            print(z.selectAsTuples({"id": 1}))
            
        elif functionName == "update":
            datos_actualizados = {
                "id": 1, 
                "codigo_distrito_barrio": 1195, 
                "nombre": "El Palmar (Actualizado)",
                "codigo_distrito": 19, 
                "codigo_barrio": 5, 
                "area": 25000.50,
                "geometria_wkt": "POLYGON((-0.3800 39.4750, -0.3700 39.4750, -0.3700 39.4650, -0.3800 39.4650, -0.3800 39.4750))"
            }
            print(z.update(datos_actualizados))
            
        elif functionName == "delete":
            print(z.delete({"id": 3}))

if __name__ == "__main__":
    main()