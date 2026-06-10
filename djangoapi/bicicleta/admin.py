from django.contrib.gis import admin
from .models import Barrio, CarrilBici, EstacionBicicleta

@admin.register(Barrio)
class BarrioAdmin(admin.GISModelAdmin):
    list_display = ('nombre', 'codigo_barrio')
    search_fields = ('nombre',)

@admin.register(CarrilBici)
class CarrilBiciAdmin(admin.GISModelAdmin):
    list_display = ('objectid', 'estado', 'longitud_shape')

@admin.register(EstacionBicicleta)
class EstacionBicicletaAdmin(admin.GISModelAdmin):
    list_display = ('numero', 'nombre', 'address', 'bicis_disponibles', 'bornes_libres')
    search_fields = ('nombre', 'numero')