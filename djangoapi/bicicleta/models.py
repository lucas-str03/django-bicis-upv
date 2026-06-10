from django.contrib.gis.db import models

# 1. CAPA ESTÁTICA: BARRIOS (Polígonos)
class Barrio(models.Model):
    objectid = models.IntegerField(primary_key=True)
    codigo_barrio = models.CharField(max_length=10)
    nombre = models.CharField(max_length=100)
    coddistbar = models.CharField(max_length=10, blank=True, null=True)
    geom = models.MultiPolygonField(srid=4326)

    def __str__(self):
        return self.nombre

# 2. CAPA ESTÁTICA: CARRILES BICI (Líneas)
class CarrilBici(models.Model):
    objectid = models.IntegerField(primary_key=True)
    estado = models.CharField(max_length=10, blank=True, null=True)
    longitud_shape = models.FloatField(null=True, blank=True)
    geom = models.MultiLineStringField(srid=4326)

    def __str__(self):
        return f"Carril {self.objectid}"

# 3. CAPA DINÁMICA: ESTACIONES (Puntos)
class EstacionBicicleta(models.Model):
    numero = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=255)
    address = models.CharField(max_length=255, blank=True, null=True)
    capacidad = models.IntegerField(default=0)
    bicis_disponibles = models.IntegerField(default=0)
    bornes_libres = models.IntegerField(default=0)
    ultima_actualizacion = models.DateTimeField(auto_now=True)
    geom = models.PointField(srid=4326)

    def __str__(self):
        return f"{self.numero} - {self.nombre}"