from django.contrib import admin
from django.utils.html import mark_safe
from django.urls import path
from ecommerce.models import User, Product, Category, Order, OrderDetail, Store, Tag, Comment, Rating, Cart, CartItem
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
import datetime

# Register your models here.
class DetailInline(admin.TabularInline):
    model = OrderDetail
    extra = 1

class ProductForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Product
        fields = '__all__'
class MyUserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'first_name', 'last_name', 'gender', 'role', 'is_active']
    search_fields = ['username', 'first_name', 'last_name']
    list_filter = ['id', 'username']
    readonly_fields = ['my_avatar']

    def my_avatar(self, obj):
        if obj.avatar:
            return mark_safe(f'<img src="{obj.avatar.url}" width="150" height="150" />')
        return "No Image"

class MyProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'inventory_quantity', 'price', 'created_date', 'updated_date', 'active']
    search_fields = ['name', 'description']
    list_filter = ['id', 'created_date', 'name']
    form = ProductForm
    readonly_fields = ['my_image']

    def my_image(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="150" height="150" />')
        return "No Image"

class MyCategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_date', 'updated_date', 'active']
    search_fields = ['name']
    list_filter = ['id', 'created_date', 'name']
class MyStoreAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone_number', 'created_date', 'updated_date', 'owner', 'active']
    search_fields = ['name']
    list_filter = ['id', 'created_date', 'name']
    readonly_fields = ['my_image']

    def my_image(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="150" height="150" />')
        return "No Image"

class MyTagAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_date', 'updated_date', 'active']
    search_fields = ['name']
    list_filter = ['id', 'created_date', 'name']

class MyCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'buyer', 'created_date', 'updated_date', 'active']
    search_fields = ['product', 'content', 'buyer']
    list_filter = ['id', 'product', 'buyer']
class MyRatingAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'buyer', 'rating', 'created_date', 'updated_date', 'active']
    search_fields = ['product', 'rating', 'buyer']
    list_filter = ['id', 'product', 'buyer', 'rating']

class MyOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'store', 'buyer', 'total_price', 'status', 'created_date', 'updated_date', 'active']
    search_fields = ['store', 'buyer']
    list_filter = ['id', 'store', 'buyer']
    inlines = [DetailInline]

class MyOrderDetailAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product', 'price', 'quantity']

admin.site.register(User, MyUserAdmin)
admin.site.register(Category, MyCategoryAdmin)
admin.site.register(Tag, MyTagAdmin)
admin.site.register(Store, MyStoreAdmin)
admin.site.register(Comment, MyCommentAdmin)
admin.site.register(Rating, MyRatingAdmin)
admin.site.register(Product, MyProductAdmin)
admin.site.register(Order, MyOrderAdmin)
admin.site.register(OrderDetail, MyOrderDetailAdmin)
admin.site.register(Cart)
admin.site.register(CartItem)
