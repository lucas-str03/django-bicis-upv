from django.contrib.gis.db import models

# 1. CAPA ESTÁTICA: BARRIOS (Polígonos)
class Barrio(models.Model):
    nombre = models.CharField(max_length=100)
    codigo_barrio = models.CharField(max_length=10, primary_key=True)
    geom = models.MultiPolygonField(srid=4326)

    def __str__(self):
        return self.nombre

# 2. CAPA ESTÁTICA: CARRILES BICI (Líneas)
class CarrilBici(models.Model):

    id = models.IntegerField(primary_key=True)

    tipo = models.CharField(max_length=50) 
    longitud = models.FloatField(null=True, blank=True)
    # Geometría: MultiLineString por si el carril tiene tramos cortados
    geom = models.MultiLineStringField(srid=4326)

    def __str__(self):
        return f"Carril {self.id}"

# 3. CAPA DINÁMICA: ESTACIONES (Puntos)
class EstacionBicicleta(models.Model):
    numero = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=255)
    capacidad = models.IntegerField(default=0)
    
    # Estos campos se actualizarán en el futuro con la API de Valencia
    bicis_disponibles = models.IntegerField(default=0)
    bornes_libres = models.IntegerField(default=0)
    ultima_actualizacion = models.DateTimeField(auto_now=True)
    
    # Geometría: Punto exacto
    geom = models.PointField(srid=4326)

    def __str__(self):
        return f"{self.numero} - {self.nombre}"