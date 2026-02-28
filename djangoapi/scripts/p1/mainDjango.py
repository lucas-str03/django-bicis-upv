from scripts.p1.estaciones.estacionesDjango import EstacionesDjango
from scripts.p1.barrios.barriosDjango import BarriosDjango  
from scripts.p1.carriles.carrilesDjango import CarrilesDjango

def run(*args):
    # args recogerá los parámetros que le pasemos por la terminal
    if len(args) < 2:
        print("Faltan parámetros. Usa: <tabla> <operacion>")
        return

    tableName = args[0]
    functionName = args[1]

    # ==========================================
    # 1. Lógica para ESTACIONES (Django ORM)
    # ==========================================
    if tableName == "estaciones":
        e = EstacionesDjango()
        
        if functionName == "insert":
            datos = {
                "numero": 50, 
                "direccion": "Estación Django - Plaza Redonda",
                "activo": "T",
                "bicis": 15, 
                "espacios_libres": 5, 
                "espacios_totales": 20,
                "lon": -0.3768, # Coordenadas dentro de nuestro barrio gigante
                "lat": 39.4699
            }
            print(e.insert(datos))
            
        elif functionName == "selectAsDicts":
            # Buscaremos la ID 1 (como es una tabla nueva, la primera será la 1)
            print(e.selectAsDicts({"id": 1}))
            
        elif functionName == "update":
            datos_nuevos = {
                "id": 1, 
                "activo": "F", # La apagamos
                "bicis": 0, 
                "espacios_libres": 20, 
                "lon": -0.3768, 
                "lat": 39.4699
            }
            print(e.update(datos_nuevos))
            
        elif functionName == "delete":
            print(e.delete({"id": 1}))

    # ==========================================
    # 2. Lógica para BARRIOS (Django ORM)
    # ==========================================
    elif tableName == "zonas":
        z = BarriosDjango()
        
        if functionName == "insert":
            datos = {
                "codigo_distrito_barrio": 1195, 
                "nombre": "Barrio Django Gigante",
                "codigo_distrito": 19, 
                "codigo_barrio": 5, 
                "area": 25000.50,
                # Este polígono contiene nuestras coordenadas de la estación
                "geometria_wkt": "POLYGON((-0.3800 39.4750, -0.3700 39.4750, -0.3700 39.4650, -0.3800 39.4650, -0.3800 39.4750))"
            }
            print(z.insert(datos))
            
        elif functionName == "selectAsDicts":
            print(z.selectAsDicts({"id": 1}))
            
        elif functionName == "update":
            datos_actualizados = {
                "id": 1, 
                "codigo_distrito_barrio": 1195, 
                "nombre": "Barrio Django Actualizado",
                "codigo_distrito": 19, 
                "codigo_barrio": 5, 
                "area": 25000.50,
                "geometria_wkt": "POLYGON((-0.3800 39.4750, -0.3700 39.4750, -0.3700 39.4650, -0.3800 39.4650, -0.3800 39.4750))"
            }
            print(z.update(datos_actualizados))
            
        elif functionName == "delete":
            print(z.delete({"id": 1}))

    
    # ==========================================
    # 3. Lógica para CARRILES (Django ORM)
    # ==========================================
    elif tableName == "carriles":
        c = CarrilesDjango()
        
        if functionName == "insert":
            datos = {
                "objectid": 1001, 
                "tipo": "Ciclocalle Django", 
                "longitud": 150.5, 
                "geometria_wkt": "LINESTRING(-0.3732 39.4683, -0.3689 39.4701)"
            }
            print(c.insert(datos))
            
        elif functionName == "selectAsDicts":
            print(c.selectAsDicts({"id": 1}))
            
        elif functionName == "update":
            datos_actualizados = {
                "id": 1, 
                "tipo": "Carril Bici Segregado Django", 
                "longitud": 200.0, 
                "geometria_wkt": "LINESTRING(-0.3732 39.4683, -0.3689 39.4701)"
            }
            print(c.update(datos_actualizados))
            
        elif functionName == "delete":
            print(c.delete({"id": 1}))