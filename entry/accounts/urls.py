# accounts/urls.py
from django.urls import path
from .views import api_register, api_login, profile, index

urlpatterns = [
    path('', index, name='index'),
    path('register/', api_register, name='api_register'),
    path('login/', api_login, name='api_login'),
    path('profile/', profile, name='profile'),
]