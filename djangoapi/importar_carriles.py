import json

import os

import django



# 1. Configuración de entorno con la ruta exacta de tu settings.py

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoapi.settings')

django.setup()



from django.contrib.gis.geos import GEOSGeometry, MultiLineString

from bicicleta.models import CarrilBici  # Usamos el nombre exacto de tu modelo



def importar():

    # 2. Borrado de la tabla actual para evitar duplicados

    print("Borrando carriles antiguos de la base de datos...")

    CarrilBici.objects.all().delete()

    print("¡Base de datos limpia!")



    # 3. Lectura del archivo GeoJSON (Asegúrate de que la ruta es correcta)

    geojson_path = 'data/carriles.geojson'

   

    with open(geojson_path, 'r', encoding='utf-8') as f:

        data = json.load(f)



    cargados = 0

    errores = 0



    print(f"Procesando {len(data['features'])} carriles...")



    for feature in data['features']:

        try:

            p = feature['properties']

            geom = GEOSGeometry(json.dumps(feature['geometry']))



            # 4. Asegurar MultiLineString

            if geom.geom_type == 'LineString':

                geom = MultiLineString(geom)



            # 5. Creación del registro en PostgreSQL

            CarrilBici.objects.create(

                objectid=p['objectid'],

               

                # 🌟 Aquí está la corrección: metemos el estado oficial en tu columna 'estado'

                estado=str(p.get('estado', '')),

               

                # Guardamos la longitud en tu columna 'longitud_shape'

                longitud_shape=p.get('st_length(shape)', 0),

               

                geom=geom

            )

            cargados += 1

           

        except Exception as e:

            print(f"Error en feature {feature.get('id')}: {e}")

            errores += 1



    print("-" * 30)

    print(f"✅ Cargados: {cargados} | ❌ Errores: {errores}")

    print(f"📊 Total real en BD: {CarrilBici.objects.count()}")



if __name__ == '__main__':

    importar() 

