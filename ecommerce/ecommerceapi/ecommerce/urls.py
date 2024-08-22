from django.urls import path, include
from rest_framework import routers

from ecommerce import views

r = routers.DefaultRouter()

urlpatterns = [
    path('', include(r.urls)),
]