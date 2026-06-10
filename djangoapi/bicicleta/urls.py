from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import (
    EstacionBicicletaView, BarrioView, CarrilBiciView,
    login_view, logout_view, is_logged_in_view,
    selectall_view, actualizar_estaciones_view
)

urlpatterns = [
    # Capas GIS
    path('estaciones/', EstacionBicicletaView.as_view(), name='estaciones'),
    path('barrios/', BarrioView.as_view(), name='barrios'),
    path('carriles/', CarrilBiciView.as_view(), name='carriles'),
    path('selectall/', selectall_view, name='selectall'),
    path('actualizar-estaciones/', actualizar_estaciones_view, name='actualizar_estaciones'),

    # Autenticación (Rutas limpias, sin el prefijo 'core/')
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('isloggedin/', csrf_exempt(is_logged_in_view), name='isloggedin'),
]