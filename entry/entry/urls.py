# myproject/urls.py
from django.contrib import admin
from .views import MovieChatAPIView
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')), 
    path('', include('accounts.urls')), 
    path('api/movie-chat/', MovieChatAPIView.as_view(), name='movie-chat-api'),
]