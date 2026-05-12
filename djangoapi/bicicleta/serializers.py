from rest_framework import serializers
from .models import EstacionBicicleta, Barrio, CarrilBici

# Traductor para los Barrios (Polígonos)
class BarrioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barrio
        fields = '__all__' # Traduce todas las columnas

# Traductor para los Carriles (Líneas)
class CarrilBiciSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarrilBici
        fields = '__all__'

# Traductor para las Estaciones (Puntos)
class EstacionBicicletaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstacionBicicleta
        fields = '__all__'