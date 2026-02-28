from geoportal.models import Barrio
from django.contrib.gis.geos import GEOSGeometry
from django.forms.models import model_to_dict

class BarriosDjango():
    def insert(self, d):
        try:
            # 1. Leer geometría de texto WKT a objeto GeoDjango
            poligono = GEOSGeometry(d['geometria_wkt'], srid=25830)
            
            # 2. Validación: Geometría válida
            if not poligono.valid:
                return {"ok": False, "message": "Reject: Geometría inválida", "data": None}

            # 3. Validación: Comprobar si choca con otro barrio (intersects)
            if Barrio.objects.filter(geometria__intersects=poligono).exists():
                return {"ok": False, "message": "Reject polygons that intersects", "data": None}

            # 4. Inserción estilo Django
            b = Barrio()
            b.codigo_distrito_barrio = d['codigo_distrito_barrio']
            b.nombre_barrio = d['nombre']
            b.codigo_distrito = d['codigo_distrito']
            b.codigo_barrio = d['codigo_barrio']
            b.area_m2 = d['area']
            b.geometria = poligono
            b.save()
            
            return {"ok": True, "message": "Data inserted", "data": [{"id": b.id}]}
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}

    def selectAsDicts(self, d):
        try:
            lista = list(Barrio.objects.filter(id=d['id']))
            if len(lista) == 0:
                return {"ok": False, "message": "ID not found", "data": []}
            
            b = lista[0]
            diccionario = model_to_dict(b)
            diccionario['geometria'] = b.geometria.wkt
            return {"ok": True, "message": "Data retrieved", "data": [diccionario]}
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}

    def update(self, d):
        try:
            lista = list(Barrio.objects.filter(id=d['id']))
            if len(lista) == 0:
                return {"ok": False, "message": "ID not found", "data": []}
                
            b = lista[0]
            b.codigo_distrito_barrio = d['codigo_distrito_barrio']
            b.nombre_barrio = d['nombre']
            b.codigo_distrito = d['codigo_distrito']
            b.codigo_barrio = d['codigo_barrio']
            b.area_m2 = d['area']
            b.geometria = GEOSGeometry(d['geometria_wkt'], srid=25830)
            b.save()
            
            return {"ok": True, "message": "Data updated", "data": [{"rows_updated": 1}]}
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}

    def delete(self, d):
        try:
            eliminados = Barrio.objects.filter(id=d['id']).delete()
            return {"ok": True, "message": "Data deleted", "data": [{"rows_deleted": eliminados[0]}]}
        except Exception as e:
            return {"ok": False, "message": str(e), "data": None}