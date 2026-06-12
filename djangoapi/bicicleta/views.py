import json
from django.http import JsonResponse, QueryDict
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
import requests as http_requests

from .models import EstacionBicicleta, Barrio, CarrilBici
from .serializers import EstacionBicicletaSerializer, BarrioSerializer, CarrilBiciSerializer


# --- MIXIN DE CONTROL DE ROLES ---

class RoleRequiredMixin:
    """
    Mixin adaptado: 
    - GET (Leer datos) -> Público para todo el mundo.
    - POST, PUT, DELETE (Editar) -> Requiere sesión activa.
    - Los administradores tienen acceso total automático.
    - Los usuarios normales deben pertenecer al grupo 'editor'.
    """
    def dispatch(self, request, *args, **kwargs):
        # 1. Todo el mundo puede consultar los datos para pintarlos en el mapa
        if request.method == 'GET':
            return super().dispatch(request, *args, **kwargs)

        # 2. A partir de aquí (POST, PUT, DELETE), exigimos estar logueado
        if not request.user.is_authenticated:
            return JsonResponse(
                {"ok": False, "message": "Debes iniciar sesión para editar el mapa.", "data": []},
                status=401
            )

        # 3. El usuario 'admin' (superusuario) tiene permiso absoluto siempre
        if request.user.is_superuser:
            return super().dispatch(request, *args, **kwargs)

        # 4. Lógica para usuarios normales (verificamos si es 'editor')
        user_groups = list(request.user.groups.values_list('name', flat=True))
        is_editor = 'editor' in user_groups

        if not is_editor:
            return JsonResponse(
                {"ok": False, "message": "Tu usuario no tiene permisos de editor.", "data": []},
                status=403
            )

        # 5. Acceso permitido a la edición
        return super().dispatch(request, *args, **kwargs)


# --- FUNCIÓN GENÉRICA PARA EL CRUD ---

def get_crud_response(model_class, serializer_class, request, pk_field='id'):
    try:
        if request.method == 'GET':
            pk_value = request.GET.get(pk_field)
            if pk_value:
                obj = model_class.objects.get(**{pk_field: pk_value})
                return JsonResponse({"ok": True, "message": "Registro recuperado", "data": [serializer_class(obj).data]})
            return JsonResponse({"ok": True, "message": "Datos recuperados", "data": serializer_class(model_class.objects.all(), many=True).data})

        if request.content_type == 'application/x-www-form-urlencoded':
            data = request.POST.dict() if request.method == 'POST' else QueryDict(request.body).dict()
        else:
            data = json.loads(request.body)

        if request.method == 'POST':
            ser = serializer_class(data=data)
            if ser.is_valid():
                ser.save()
                return JsonResponse({"ok": True, "message": "Insertado correctamente", "data": [ser.data]}, status=201)
            return JsonResponse({"ok": False, "message": "Error", "data": ser.errors}, status=400)

        if request.method == 'PUT':
            obj = model_class.objects.get(**{pk_field: data.get(pk_field)})
            ser = serializer_class(obj, data=data, partial=True)
            if ser.is_valid():
                ser.save()
                return JsonResponse({"ok": True, "message": "Actualizado correctamente", "data": [ser.data]})
            return JsonResponse({"ok": False, "message": "Error", "data": ser.errors}, status=400)

        if request.method == 'DELETE':
            obj = model_class.objects.get(**{pk_field: data.get(pk_field)})
            obj.delete()
            return JsonResponse({"ok": True, "message": "Borrado correctamente", "data": []})

    except Exception as e:
        return JsonResponse({"ok": False, "message": str(e), "data": []}, status=400)


# --- VISTAS PROTEGIDAS DE LAS TABLAS ---

@method_decorator(csrf_exempt, name='dispatch')
class EstacionBicicletaView(RoleRequiredMixin, View):
    def get(self, request, *args, **kwargs): return get_crud_response(EstacionBicicleta, EstacionBicicletaSerializer, request, pk_field='numero')
    def post(self, request, *args, **kwargs): return get_crud_response(EstacionBicicleta, EstacionBicicletaSerializer, request, pk_field='numero')
    def put(self, request, *args, **kwargs): return get_crud_response(EstacionBicicleta, EstacionBicicletaSerializer, request, pk_field='numero')
    def delete(self, request, *args, **kwargs): return get_crud_response(EstacionBicicleta, EstacionBicicletaSerializer, request, pk_field='numero')

@method_decorator(csrf_exempt, name='dispatch')
class BarrioView(RoleRequiredMixin, View):
    def get(self, request, *args, **kwargs): return get_crud_response(Barrio, BarrioSerializer, request, pk_field='objectid')
    def post(self, request, *args, **kwargs): return get_crud_response(Barrio, BarrioSerializer, request, pk_field='objectid')
    def put(self, request, *args, **kwargs): return get_crud_response(Barrio, BarrioSerializer, request, pk_field='objectid')
    def delete(self, request, *args, **kwargs): return get_crud_response(Barrio, BarrioSerializer, request, pk_field='objectid')

@method_decorator(csrf_exempt, name='dispatch')
class CarrilBiciView(RoleRequiredMixin, View):
    def get(self, request, *args, **kwargs): return get_crud_response(CarrilBici, CarrilBiciSerializer, request, pk_field='objectid')
    def post(self, request, *args, **kwargs): return get_crud_response(CarrilBici, CarrilBiciSerializer, request, pk_field='objectid')
    def put(self, request, *args, **kwargs): return get_crud_response(CarrilBici, CarrilBiciSerializer, request, pk_field='objectid')
    def delete(self, request, *args, **kwargs): return get_crud_response(CarrilBici, CarrilBiciSerializer, request, pk_field='objectid')

# --- FUNCIONES DE AUTENTICACIÓN ---

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            if request.content_type == 'application/x-www-form-urlencoded':
                data = request.POST.dict()
            else:
                data = json.loads(request.body)

            username = data.get('username')
            password = data.get('password')

            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                groups = list(user.groups.values_list('name', flat=True))
                return JsonResponse({"ok": True, "message": "¡Bienvenido!", "data": [{"username": user.username, "groups": groups}]})
            else:
                return JsonResponse({"ok": False, "message": "Credenciales incorrectas", "data": []}, status=401)
        except Exception as e:
            return JsonResponse({"ok": False, "message": str(e), "data": []}, status=400)

@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True, "message": "Sesión cerrada", "data": []})

@csrf_exempt
def is_logged_in_view(request):
    # Si el navegador envía un preflight CORS (OPTIONS), le damos paso libre con un 200 OK
    if request.method == 'OPTIONS':
        response = JsonResponse({"ok": True})
        return response

    # Lógica normal para el GET/POST de Angular
    if request.user.is_authenticated:
        groups = list(request.user.groups.values_list('name', flat=True))
        return JsonResponse({"ok": True, "message": "Sesión activa", "data": [{"username": request.user.username, "groups": groups}]})
    
    return JsonResponse({"ok": False, "message": "No hay sesión activa", "data": []})


# --- NUEVO ENDPOINT PARA CARGAR VECTORES EN EL MAPA ---

@csrf_exempt
def selectall_view(request):
    """
    Este endpoint devuelve TODAS las geometrías de la base de datos en formato WKT.
    Es público (cualquiera puede ver el mapa interactivo, la restricción está en editar).
    """
    try:
        # 1. Extraer Barrios
        barrios_data = []
        for b in Barrio.objects.all():
            if b.geom:
                barrios_data.append({
                    "objectid": b.objectid,
                    "codigo_barrio": b.codigo_barrio,
                    "nombre": b.nombre,
                    "wkt": b.geom.wkt
                })

        # 2. Extraer Carriles Bici
        carriles_data = []
        for c in CarrilBici.objects.all():
            if c.geom:
                carriles_data.append({
                    "id": c.objectid,
                    "tipo": c.estado,
                    "wkt": c.geom.wkt
                })

        # 3. Extraer Estaciones
        estaciones_data = []
        for e in EstacionBicicleta.objects.all():
            if e.geom:
                estaciones_data.append({
                    "numero": e.numero,
                    "nombre": e.nombre,
                    "wkt": e.geom.wkt
                })

        # Devolvemos un mega-JSON estructurado por capas
        return JsonResponse({
            "ok": True,
            "message": "Geometrías vectoriales cargadas con éxito",
            "data": {
                "barrios": barrios_data,
                "carriles": carriles_data,
                "estaciones": estaciones_data
            }
        })

    except Exception as e:
        return JsonResponse({"ok": False, "message": str(e), "data": []}, status=500)
    
@csrf_exempt
def actualizar_estaciones_view(request):
    if request.method != 'POST':
        return JsonResponse({"ok": False, "message": "Método no permitido", "data": []}, status=405)
    
    # CORRECCIÓN DE SEGURIDAD 1: Comprobar autenticación
    if not request.user.is_authenticated:
        return JsonResponse({"ok": False, "message": "No autorizado. Debes iniciar sesión.", "data": []}, status=401)
    
    # CORRECCIÓN DE SEGURIDAD 2: Comprobar grupo editor o admin
    user_groups = list(request.user.groups.values_list('name', flat=True))
    if not (request.user.is_superuser or 'editor' in user_groups):
        return JsonResponse({"ok": False, "message": "Permisos insuficientes. Solo los editores pueden sincronizar con el Geoportal.", "data": []}, status=403)
    
    try:
        url = "https://geoportal.valencia.es/server/rest/services/OPENDATA/Trafico/MapServer/228/query?where=1=1&outFields=*&f=json"
        r = http_requests.get(url, timeout=15)
        data = r.json()
        features = data.get('features', [])

        actualizadas = 0
        no_encontradas = 0

        for feature in features:
            attrs = feature['attributes']
            numero = attrs.get('number')
            if not numero:
                continue
            updated = EstacionBicicleta.objects.filter(numero=numero).update(
                bicis_disponibles=attrs.get('available', 0),
                bornes_libres=attrs.get('free', 0),
                capacidad=attrs.get('total', 0),
            )
            if updated:
                actualizadas += 1
            else:
                no_encontradas += 1

        return JsonResponse({
            "ok": True,
            "message": f"Estaciones actualizadas: {actualizadas}. No encontradas en BD: {no_encontradas}.",
            "data": [{"actualizadas": actualizadas, "no_encontradas": no_encontradas}]
        })

    except Exception as e:
        return JsonResponse({"ok": False, "message": str(e), "data": []}, status=500)