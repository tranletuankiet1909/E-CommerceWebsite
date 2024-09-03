from rest_framework import viewsets, generics, status, permissions, parsers
from rest_framework.decorators import action
from rest_framework.response import Response

import ecommerce.models
from ecommerce import serializers, paginators, perms
from ecommerce.models import Category, Product, Comment, Rating, Store, User, Tag, Order, OrderDetail, Cart, CartItem
from django.db.models import Q

class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = serializers.CategorySerializer

    @action(methods=['get'], url_path='products', detail=True)
    def get_products(self, request, pk):
        products = self.get_object().products_cate.filter(active=True)
        return Response(serializers.ProductSerializer(products, many=True).data)

class ProductViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.filter(active=True)
    serializer_class = serializers.ProductDetailsSerializer
    pagination_class = paginators.ProductPaginator

    def get_queryset(self):
        queryset = self.queryset
        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(Q(name__icontains=q) | Q(store__name__icontains=q))

            cate_id = self.request.query_params.get('category_id')
            if cate_id:
                queryset = queryset.filter(category_id=cate_id)

            store_id = self.request.query_params.get('store_id')
            if store_id:
                queryset = queryset.filter(store_id=store_id)

        return queryset

    def get_permissions(self):
        if self.action in ['add_comment', 'add_rating']:
            return [perms.IsBuyerUser()]

        if self.action in ['add_tag']:
            return [perms.ProductOwner()]

        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [perms.ProductOwner()]

        return [permissions.AllowAny()]

    @action(methods=['post'], url_path='add-comment', detail=True)
    def add_comment(self, request, pk):
        parent_id = request.data.copy().get('parent')
        if parent_id:
            parent = Comment.objects.get(id=parent_id)
        else:
            parent = None

        c = self.get_object().comment_set.create(content=request.data.get('content'), parent=parent, buyer=request.user)
        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='add-rating', detail=True)
    def add_rating(self, request, pk):
        c = self.get_object().rating_set.create(rating=request.data.get('rating'), buyer=request.user)
        return Response(serializers.RatingSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='comments', detail=True)
    def get_comments(self, request, pk):
        comments = self.get_object().comment_set.select_related('buyer').order_by('-id')
        paginator = paginators.ReviewPaginator()

        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data)

    @action(methods=['get'], url_path='ratings', detail=True)
    def get_ratings(self, request, pk):
        ratings = self.get_object().rating_set.select_related('buyer').order_by('-id')
        paginator = paginators.ReviewPaginator()

        page = paginator.paginate_queryset(ratings, request)
        if page is not None:
            serializer = serializers.RatingSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.RatingSerializer(ratings, many=True).data)

class StoreViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Store.objects.all()
    serializer_class = serializers.StoreSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_permissions(self):
        if self.action in ['add_product', 'get_orders']:
            return [perms.StoreOwner()]
        if self.request.method == 'POST':
            return [perms.IsSellerUser()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(methods=['get'], url_path='products', detail=True)
    def get_products(self, request, pk):
        products = self.get_object().products_store.filter(active=True)
        q = request.query_params.get('q')
        if q:
            products = products.filter(name__icontains=q)
        cate_id = self.request.query_params.get('category_id')
        if cate_id:
            products = products.filter(category_id=cate_id)

        paginator = paginators.ProductPaginator()

        page = paginator.paginate_queryset(products, request)
        if page is not None:
            serializer = serializers.ProductSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.ProductSerializer(products, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='add-product', detail=True)
    def add_product(self, request, pk=None):
        try:
            store = self.get_object()
        except Store.DoesNotExist:
            return Response({"detail": "Store does not exist or you don't have permission to access this store"},
                            status=status.HTTP_400_BAD_REQUEST)

        product_data = request.data.copy()
        serializer = serializers.ProductDetailsSerializer(data=product_data)
        if serializer.is_valid():
            product = serializer.save(store=store)
            return Response(serializers.ProductDetailsSerializer(product).data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], url_path='orders', detail=True)
    def get_orders(self, request, pk):
        orders = self.get_object().order_store.select_related('buyer').order_by('-id')
        paginator = paginators.ProductPaginator()

        page = paginator.paginate_queryset(orders, request)
        if page is not None:
            serializer = serializers.OrderSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.OrderSerializer(orders, many=True).data)


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.CommentOwner]

class RatingViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Rating.objects.filter(active=True)
    serializer_class = serializers.RatingSerializer
    permission_classes = [perms.RatingOwner]

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser,]

    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]
        if self.action in ['get_orders']:
            return [perms.IsBuyerUser()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):

            for k, v in request.data.items():
                setattr(user, k, v)
            user.save()
        return Response(serializers.UserSerializer(user).data)

    @action(methods=['get'], url_path='orders', detail=True)
    def get_orders(self, request, pk):
        orders = self.get_object().order_buyer.select_related('store').order_by('-id')
        paginator = paginators.OrderPaginator()

        page = paginator.paginate_queryset(orders, request)
        if page is not None:
            serializer = serializers.OrderSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.OrderSerializer(orders, many=True).data)


class CartViewSet(viewsets.ViewSet, generics.GenericAPIView):
    queryset = Cart.objects.all()
    serializer_class = serializers.CartSerializer
    permission_classes = [perms.CartOwner]

    def get_queryset(self):
        return Cart.objects.filter(buyer=self.request.user)

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        cart, created = Cart.objects.get_or_create(buyer=request.user)
        return Response(serializers.CartSerializer(cart).data)

    @action(detail=True, methods=['post'])
    def add_to_cart(self, request, pk):
        cart, created = Cart.objects.get_or_create(buyer=request.user)
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        product = Product.objects.get(id=product_id)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += int(quantity)
        else:
            cart_item.quantity = int(quantity)
        cart_item.save()

        return Response(serializers.CartSerializer(cart).data)

    @action(detail=True, methods=['post'])
    def update_quantity(self, request, pk):
        cart = self.get_object()
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity', 1)

        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        cart_item.quantity = int(quantity)
        cart_item.save()

        return Response(serializers.CartSerializer(cart).data)

    @action(detail=True, methods=['post'])
    def select_item(self, request, pk):
        cart = self.get_object()
        item_id = request.data.get('item_id')
        # selected = request.data.get('selected', True)

        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        if cart_item.selected:
            cart_item.selected = False
        else:
            cart_item.selected = True
        # cart_item.selected = selected
        cart_item.save()

        return Response(serializers.CartSerializer(cart).data)
    @action(methods=['post'], detail=True)
    def check_out(self, request, pk):
        cart = self.get_object()
        selected_items = cart.items.filter(selected=True)

        if not selected_items.exists():
            return Response({'error': 'No items selected for checkout'}, status=status.HTTP_400_BAD_REQUEST)

        orders = []
        store_items = {}

        for item in selected_items:
            store = item.product.store
            if store not in store_items:
                store_items[store] = []
            store_items[store].append(item)

        for store, items in store_items.items():
            order = Order.objects.create(buyer=request.user, store=store)

            for item in items:
                OrderDetail.objects.create(order=order, product=item.product, quantity=item.quantity)

            orders.append(order)
            for item in items:
                item.delete()
        print(orders)
        return Response(serializers.OrderSerializer(orders, many=True).data)

class OrderViewSet(viewsets.ViewSet, generics.GenericAPIView):
    queryset = Order.objects.filter(active=True)
    serializer_class = serializers.OrderSerializer

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        if order.store.owner != request.user:
            return Response({'error': 'You do not have permission to update this order'}, status=status.HTTP_400_BAD_REQUEST)

        status1 = request.data.get('status')
        if status1 not in dict(ecommerce.models.STATUS_ORDER_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = status1
        order.save()
        return Response(serializers.OrderSerializer(order).data)

class CartItemViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    queryset = CartItem.objects.all()
    serializer_class = serializers.CartItemSerializer
    permission_classes = [perms.CartItemOwner]

