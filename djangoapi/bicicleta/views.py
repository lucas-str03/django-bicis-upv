import json
from django.http import JsonResponse, QueryDict
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout

from .models import EstacionBicicleta, Barrio, CarrilBici
from .serializers import EstacionBicicletaSerializer, BarrioSerializer, CarrilBiciSerializer

# Función genérica para el CRUD de las tablas
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

# Vistas de las tablas
@method_decorator(csrf_exempt, name='dispatch')
class EstacionBicicletaView(View):
    def dispatch(self, request, *args, **kwargs):
        return get_crud_response(EstacionBicicleta, EstacionBicicletaSerializer, request, pk_field='numero')

@method_decorator(csrf_exempt, name='dispatch')
class BarrioView(View):
    def dispatch(self, request, *args, **kwargs):
        return get_crud_response(Barrio, BarrioSerializer, request, pk_field='codigo_barrio')

@method_decorator(csrf_exempt, name='dispatch')
class CarrilBiciView(View):
    def dispatch(self, request, *args, **kwargs):
        return get_crud_response(CarrilBici, CarrilBiciSerializer, request, pk_field='id')
    
# --- FUNCIONES DE AUTENTICACIÓN  ---

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            # Detectamos si viene como Formulario o como JSON
            if request.content_type == 'application/x-www-form-urlencoded':
                data = request.POST.dict()
            else:
                data = json.loads(request.body)

            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({"ok": True, "message": "¡Bienvenido!", "data": [{"username": user.username}]})
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
    if request.user.is_authenticated:
        return JsonResponse({"ok": True, "message": "Sesión activa", "data": [{"username": request.user.username}]})
    return JsonResponse({"ok": False, "message": "No hay sesión activa", "data": []})