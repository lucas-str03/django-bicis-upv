from django.urls import path
from .views import (
    EstacionBicicletaView, BarrioView, CarrilBiciView, 
    login_view, logout_view, is_logged_in_view
)

urlpatterns = [
    # Rutas para las tablas (CRUD)
    path('estaciones/', EstacionBicicletaView.as_view(), name='estaciones'),
    path('barrios/', BarrioView.as_view(), name='barrios'),
    path('carriles/', CarrilBiciView.as_view(), name='carriles'),
    
    # Rutas para la autenticación 
    # Importante: Ponemos 'core/' delante para que coincida con lo que pusimos en Angular
    path('core/login/', login_view, name='login'),
    path('core/logout/', logout_view, name='logout'),
    path('core/isloggedin/', is_logged_in_view, name='isloggedin'),
]