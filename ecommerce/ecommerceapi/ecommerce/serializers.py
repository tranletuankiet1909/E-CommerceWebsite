from rest_framework import serializers
from ecommerce.models import (User, Category, Product, Store, Order, OrderDetail, Rating, Comment, Cart, CartItem, Tag)

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'avatar', 'gender', 'birth', 'address', 'email', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            },
            'avatar': {'required': False}
        }

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.avatar:
            rep['avatar'] = instance.avatar.url
        else:
            rep['avatar'] = None
        return rep

    def create(self, validated_data):
        data = validated_data.copy()
        user = User(**data)
        user.set_password(data["password"])
        user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.SerializerMethodField()

    def get_parent(self, obj):
        if obj.parent:
            parent = Category.objects.get(pk=obj.parent.id)
            serializer = CategorySerializer(parent)
            return serializer.data
        else:
            return None

    class Meta:
        model = Category
        fields = '__all__'


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.image:
            rep['image'] = instance.image.url
        else:
            rep['image'] = None
        return rep



class StoreSerializer(ItemSerializer):
    class Meta:
        model = Store
        fields = '__all__'
        read_only_fields = ['owner']


class ProductSerializer(ItemSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image', 'category', 'store']

class ProductDetailsSerializer(ProductSerializer):
    store = StoreSerializer(required=False)
    tags = TagSerializer(many=True, required=False)

    class Meta:
        model = ProductSerializer.Meta.model
        fields = ProductSerializer.Meta.fields + ['description', 'tags', 'inventory_quantity']
        extra_kwargs = {
            'description': {'required': False, 'allow_null': True},
            'tags': {'required': False, 'allow_null': True}
        }

class OrderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderDetail
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderDetailSerializer(many=True, read_only=True)
    buyer = UserSerializer()

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['total_price']

class InteractionSerializer(serializers.ModelSerializer):
    buyer = UserSerializer()

class CommentSerializer(InteractionSerializer):
    def get_parent(self, obj):
        if obj.parent:
            parent = Comment.objects.get(pk=obj.parent.id)
            serializer = CommentSerializer(parent)
            return serializer.data
        else:
            return None

    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_date', 'updated_date', 'buyer', 'product', 'parent']

class RatingSerializer(InteractionSerializer):

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def update(self, instance, validated_data):
        buyer_data = validated_data.pop('buyer', None)
        if buyer_data:
            for attr, value in buyer_data.items():
                setattr(instance.buyer, attr, value)
            instance.buyer.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def create(self, validated_data):
        buyer_data = validated_data.pop('buyer')
        buyer = User.objects.create(**buyer_data)
        rating = Rating.objects.create(buyer=buyer, **validated_data)
        return rating

    class Meta:
        model = Rating
        fields = ['id', 'rating', 'created_date', 'updated_date', 'buyer', 'product']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = CartItem
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = '__all__'