from geoportal.models import CarrilBici
from django.contrib.gis.geos import GEOSGeometry
from django.forms.models import model_to_dict

class CarrilesDjango():
    def insert(self, d):
        try:
            # Convertir el texto WKT a un objeto Línea de GeoDjango
            linea = GEOSGeometry(d['geometria_wkt'], srid=25830)
            
            # Geometría válida
            if not linea.valid:
                return {"ok": False, "message": "Reject: Geometría inválida", "data": None}

            # No se cruce con otros carriles bici (intersects)
            if CarrilBici.objects.filter(geometria__intersects=linea).exists():
                return {"ok": False, "message": "Reject linestrings than intersects", "data": None}

            # Inserción con el ORM de Django
            c = CarrilBici()
            c.objectid = d['objectid']
            c.tipo = d['tipo']
            c.longitud_metros = d['longitud']
            c.geometria = linea
            c.save()
            
            return {"ok": True, "message": "Data inserted", "data": [{"id": c.id}]}
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}

    def selectAsDicts(self, d):
        try:
            lista = list(CarrilBici.objects.filter(id=d['id']))
            if len(lista) == 0:
                return {"ok": False, "message": "ID not found", "data": []}
            
            c = lista[0]
            diccionario = model_to_dict(c)
            diccionario['geometria'] = c.geometria.wkt
            return {"ok": True, "message": "Data retrieved", "data": [diccionario]}
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}

    def update(self, d):
        try:
            lista = list(CarrilBici.objects.filter(id=d['id']))
            if len(lista) == 0:
                return {"ok": False, "message": "ID not found", "data": []}
                
            c = lista[0]
            c.tipo = d['tipo']
            c.longitud_metros = d['longitud']
            c.geometria = GEOSGeometry(d['geometria_wkt'], srid=25830)
            c.save()
            
            return {"ok": True, "message": "Data updated", "data": [{"rows_updated": 1}]}
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}

    def delete(self, d):
        try:
            eliminados = CarrilBici.objects.filter(id=d['id']).delete()
            return {"ok": True, "message": "Data deleted", "data": [{"rows_deleted": eliminados[0]}]}
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}