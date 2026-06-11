import json

def extraer_datos(archivo_entrada, archivo_salida):
    with open(archivo_entrada, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    with open(archivo_salida, 'w', encoding='utf-8') as out:
        for feature in data['features']:
            fid = feature.get('id')
            estado = feature.get('properties', {}).get('estado', '0')
            # Escribimos el formato que usaremos para el filtro
            out.write(f"{fid},{estado}\n")
    
    print(f"✅ Extraídos {len(data['features'])} registros en {archivo_salida}")

# Cambia la última línea por esta, poniendo la ruta real de tu archivo
extraer_datos('C:/desweb/django-api-template/djangoapi/data/carriles.geojson', 'lista_ids_estado.txt')