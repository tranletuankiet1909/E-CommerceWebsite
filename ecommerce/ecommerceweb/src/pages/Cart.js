import React, { useCallback, useEffect, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Button, Checkbox, IconButton } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Contexts from '../configs/Contexts';

const Cart = () => {
    const { state } = React.useContext(Contexts);
    const user = state.user;
    const [carts, setCarts] = useState([]);
    const [cartId, setCartId] = useState(null);
    const navigate = useNavigate();

    const loadCart = async () => {
        try {
            let token = localStorage.getItem('access-token');
            console.log('Token', token);
            let res = await axios.get(`/carts/my_cart/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Data: ', res.data.items);
            setCarts(res.data.items);
            setCartId(res.data.id);
        } catch (ex) {
            console.error(ex);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const updateCartItemQuantity = async (cartItemId, quantity) => {
        try {
            let token = localStorage.getItem('access-token');
            await axios.post(`/carts/${cartId}/update_quantity/`, {
                item_id: cartItemId,
                quantity: quantity
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCarts(current => current.map(cartItem =>
                cartItem.id === cartItemId ? { ...cartItem, quantity: quantity } : cartItem
            ));
        } catch (ex) {
            console.error('Error updating cart item quantity:', ex);
        }
    };

    const deleteCartItem = async (cartItemId) => {
        try {
            let token = localStorage.getItem('access-token');
            await axios.delete(`/cartitems/${cartItemId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCarts(current => current.filter(cartItem => cartItem.id !== cartItemId));
        } catch (ex) {
            console.error('Error deleting cart item:', ex);
        }
    };

    const selectCartItem = async (cartItemId) => {
        try {
            let token = localStorage.getItem('access-token');
            await axios.post(`/carts/${cartId}/select_item/`, {
                item_id: cartItemId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCarts(current => current.map(cartItem =>
                cartItem.id === cartItemId ? { ...cartItem, selected: !cartItem.selected } : cartItem
            ));
        } catch (ex) {
            console.error('Error selecting cart item:', ex);
        }
    };

    const checkout = async (cartItemId) => {
        try {
            let token = localStorage.getItem('access-token');
            let res = await axios.post(`/carts/${cartId}/check_out/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 200) {
                alert("Payment successful!");
                loadCart();
            }
        } catch (ex) {
            alert("Chưa có sản phẩm để thanh toán");
            console.error('Error during checkout:', ex);
        }
    };

    return (
        <Box sx={{ margin: 2 }}>
            {carts.length > 0 ? (
                carts.map(c => (
                    <Card key={c.id} sx={{ marginBottom: 2 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <CardMedia
                                component="img"
                                sx={{ width: 100, height: 100, marginRight: 2 }}
                                image={c.product.image}
                                alt={c.product.name}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6">{c.product.name}</Typography>
                                <Typography variant="body2">Price: ${c.product.price} - Quantity: {c.quantity}</Typography>
                            </Box>
                            <Checkbox
                                checked={c.selected}
                                onChange={() => selectCartItem(c.id)}
                            />
                            <IconButton onClick={() => updateCartItemQuantity(c.id, c.quantity - 1)}>
                                <Remove />
                            </IconButton>
                            <Typography>{c.quantity}</Typography>
                            <IconButton onClick={() => updateCartItemQuantity(c.id, c.quantity + 1)}>
                                <Add />
                            </IconButton>
                            <IconButton onClick={() => deleteCartItem(c.id)}>
                                <Delete />
                            </IconButton>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Typography>No items in the cart.</Typography>
            )}
            {/* {carts.length > 0 && (
                <Button onClick={checkout} variant="contained" color="primary" sx={{ marginTop: 2 }}>
                    Checkout
                </Button>
            )} */}

            {carts.length > 0 && (
                <Button onClick={() => carts.filter(c => c.selected).forEach(cartItem => checkout(cartItem.id))} variant="contained" color="primary" sx={{ marginTop: 2 }}>
                    Checkout
                </Button>
            )}
        </Box>
    );
};

export default Cart;
