from django.urls import path, include
from . import views, viewsKnoxLoginManagenent
from rest_framework import routers
from django.views.decorators.csrf import csrf_exempt # ¡NUEVO! Importamos el decorador

router = routers.DefaultRouter()
#router.register(r'core', viewsKnoxLoginManagenent.KnoxLoginView)

urlpatterns = [
    path("hello_world/", views.HelloWord.as_view(),name="hello_world"),
    path('', include(router.urls)),
    path('not_loggedin/', views.notLoggedIn, name="not_loggedin"),
    
    # ¡NUEVO! Envolvemos la vista de login para que no pida CSRF Token inicial
    path('login/', csrf_exempt(views.LoginView.as_view()),name="core_login"),
    path('logout/', csrf_exempt(views.LogoutView.as_view()),name="core_logout"),

    # ¡NUEVO! Envolvemos la verificación también
    path('isloggedin/', csrf_exempt(views.IsLoggedIn.as_view()),name="isloggedin"),
    
    path('knox_login/', viewsKnoxLoginManagenent.KnoxLogin.as_view(), name='knox_login'),
    path('knox_logout/', csrf_exempt(viewsKnoxLoginManagenent.KnoxLogout.as_view()), name='knox_logout'),
    path('is_valid_token/', viewsKnoxLoginManagenent.IsValidToken.as_view(), name='is_valid_token'),
    path('logout_all_user_sessions/', viewsKnoxLoginManagenent.LogoutAllUserSessionsView.as_view(), name='logout_all_user_sessions'),
    path('logout_all_users_sessions/', viewsKnoxLoginManagenent.LogoutAllUsersSessionsView.as_view(), name='logout_all_users_sessionst'),
]   

    
    