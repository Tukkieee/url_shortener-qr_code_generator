from django.urls import path
from . import views

urlpatterns = [
    path('shorten/', views.shorten_url, name='shorten_url'),
    path('generate-code/', views.generate_code, name='generate_code'),
    path('edit/<int:pk>/', views.update_shortened_url, name='update_shortened_url'),
    path('shortened-urls/', views.get_shortened_urls, name='get_shortened_urls'),
]
