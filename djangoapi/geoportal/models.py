from django.contrib.gis.db import models

# 1. POLÍGONOS: Los Barrios
class Barrio(models.Model):
    codigo_distrito_barrio = models.IntegerField()
    nombre_barrio = models.CharField(max_length=200)
    codigo_distrito = models.IntegerField()
    codigo_barrio = models.IntegerField()
    area_m2 = models.FloatField()
    
    # Campo espacial
    geometria = models.PolygonField(srid=25830)

    def __str__(self):
        return self.nombre_barrio


# 2. LÍNEAS: Los Carriles Bici
class CarrilBici(models.Model):
    objectid = models.IntegerField()
    tipo = models.CharField(max_length=100)
    longitud_metros = models.FloatField()
    fecha_actualizacion = models.DateTimeField(auto_now=True) # Se actualiza solo
    
    # Campo espacial: Línea
    geometria = models.LineStringField(srid=25830)

    def __str__(self):
        return f"{self.tipo} (ID: {self.objectid})"


# 3. PUNTOS: Las Estaciones de Valenbisi
class EstacionValenbisi(models.Model):
    numero = models.IntegerField()
    direccion = models.CharField(max_length=200)
    activo = models.CharField(max_length=10)
    bicis_disponibles = models.IntegerField()
    espacios_libres = models.IntegerField()
    espacios_totales = models.IntegerField()
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    # Campo espacial: Punto
    geometria = models.PointField(srid=25830)

    def __str__(self):
        return f"Estación {self.numero} - {self.direccion}"