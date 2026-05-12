from geoportal.models import EstacionValenbisi, Barrio
from django.contrib.gis.geos import Point
from django.forms.models import model_to_dict # como row_factory=dict_row en OOP, nos devolverá un diccionario de django maneja automático todo

class EstacionesDjango():
    
    def insert(self, d):
        resultado = {"ok": False, "message": "", "data": None}
        try:
            # Crear el punto y lo redondeamos
            lon = round(d['lon'], 4)
            lat = round(d['lat'], 4)
            punto = Point(lon, lat, srid=25830) # Point no es texto, en un punto espacial

            # Geometría válida 
            if not punto.valid:
                return {"ok": False, "message": "Reject: Geometría inválida", "data": None}

            # Que caiga dentro de un barrio (st_within / contains)
            if not Barrio.objects.filter(geometria__contains=punto).exists(): # .filter es el equivalente exacto a escribir WHERE en SQL. Siempre 2 __ como separador
                return {"ok": False, "message": "Reject: Point must be inside a polygon (st_within)", "data": None}

            # 4. Inserción estilo Django 
            est = EstacionValenbisi()
            est.numero = d['numero']
            est.direccion = d['direccion']
            est.activo = d['activo']
            est.bicis_disponibles = d['bicis']
            est.espacios_libres = d['espacios_libres']
            est.espacios_totales = d['espacios_totales']
            est.geometria = punto
            est.save() 

            resultado["ok"] = True
            resultado["message"] = "Data inserted"
            resultado["data"] = [{"id": est.id}] # Django despues de .save guarda solo el id

        except Exception as e:
            resultado["message"] = str(e)
            
        return resultado

    def selectAsDicts(self, d):
        try:
            lista_estaciones = list(EstacionValenbisi.objects.filter(id=d['id'])) #.filter hace de buscador automatico
            if len(lista_estaciones) == 0:
                return {"ok": False, "message": "ID not found", "data": []}
            
            est = lista_estaciones[0]
            
            diccionario = model_to_dict(est)
            diccionario['geometria'] = est.geometria.wkt # WKT para geoDjango
            
            return {"ok": True, "message": "Data retrieved", "data": [diccionario]}
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}

    def update(self, d):
        try:
            lista_estaciones = list(EstacionValenbisi.objects.filter(id=d['id']))
            if len(lista_estaciones) == 0:
                 return {"ok": False, "message": "ID not found", "data": []}
                 
            est = lista_estaciones[0]
            
            # Actualizar los campos
            est.activo = d['activo']
            est.bicis_disponibles = d['bicis']
            est.espacios_libres = d['espacios_libres']
            
            # Actualizar y redondear las geometría
            lon = round(d['lon'], 4)
            lat = round(d['lat'], 4)
            est.geometria = Point(lon, lat, srid=25830)
            
            est.save() 
            
            return {"ok": True, "message": "Data updated", "data": [{"rows_updated": 1}]}
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}

    def delete(self, d):
        try:
            eliminados = EstacionValenbisi.objects.filter(id=d['id']).delete() # .filter muy importante, como el WHERE
            return {"ok": True, "message": "Data deleted", "data": [{"rows_deleted": eliminados[0]}]}  # lo mismo que self.cur.rowcount para saber si habíamos borrado 1 o 0 filas, pero para djagno
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}