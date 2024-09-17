import React, { useEffect, useState } from 'react';
import { Box, Typography, Drawer, List, ListItem, ListItemText, Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Avatar, Menu, MenuItem, AppBar, Toolbar } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Contexts from '../configs/Contexts';
import MenuIcon from '@mui/icons-material/Menu';

const Cart = () => {
    const { state, dispatch } = React.useContext(Contexts);
    const user = state.user;
    const [anchorEl, setAnchorEl] = useState(null);
    const [carts, setCarts] = useState([]);
    const [cartId, setCartId] = useState(null);
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [stores] = useState([]);

    const loadCart = async () => {
        try {
            let token = localStorage.getItem('access-token');
            let res = await axios.get(`/carts/my_cart/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
                cartItem.id === cartItemId ? { ...cartItem, quantity: quantity, total_price: quantity * cartItem.product.price } : cartItem
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

    const checkout = async () => {
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

    const calculateTotal = () => {
        return carts.reduce((total, cartItem) => {
            if (cartItem.selected) {
                return total + cartItem.quantity * cartItem.product.price;
            }
            return total;
        }, 0);
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const list = () => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>

                {user && user.role === 'BUYER' && (
                    <>
                        <ListItem button onClick={() => navigate('/carts/')}>
                            <ListItemText primary="Giỏ hàng" />
                        </ListItem>
                        <ListItem button onClick={() => navigate('/orders/')}>
                            <ListItemText primary="Đơn hàng" />
                        </ListItem>
                    </>
                )}


                {user && user.role === 'SELLER' && (
                    <>
                        {stores.length > 0 && (
                            <ListItem
                                button
                                onClick={() => {
                                    const userStore = stores.find(store => store.owner === user.id);
                                    if (userStore) {
                                        navigate('/register-product/', { state: { store_id: userStore.id, user_id: user.id } });
                                    } else {
                                        alert('Không tìm thấy cửa hàng của bạn.');
                                    }
                                }}
                            >
                                <ListItemText primary="Add Product" />
                            </ListItem>
                        )}
                        {!stores.some(store => store.owner === user.id) && (
                            <ListItem button onClick={() => navigate('/register-store/', { state: { user_id: user.id } })}>
                                <ListItemText primary="Add Store" />
                            </ListItem>
                        )}
                    </>
                )}
            </List>
        </Box>
    );

    const handleLogin = () => {
      navigate('/login/');
    };

    const handleRegister = () => {
      navigate('/register/');
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        navigate('/profile');
        handleMenuClose();
    };

    const handleLogout = () => {
        dispatch({
            type: 'logout',
        });
        navigate('/');
            handleMenuClose();
    };

    const handleHome = () => {
        navigate('/');
    };

    return (
        <>
            <div className="home-container">
            <div style={{ backgroundColor: "black"}} >
                <AppBar style={{ marginBottom: 10 }} position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={toggleDrawer(true)}
                            disabled={!user}
                        >
                            <MenuIcon style={{ color: "white" }} />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={handleHome}>
                            ECOMMERCE
                        </Typography>
                        {!user ? (
                            <>
                                <Button variant="contained" color="primary" onClick={handleLogin} style={{ marginLeft: 10, border: "1px solid white" }}>
                                    Đăng nhập
                                </Button>
                                <Button variant="contained" color="secondary" onClick={handleRegister} style={{ marginLeft: 10, border: "1px solid white" }}>
                                    Đăng ký
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* <Avatar alt={user.username} src={user.avatar} style={{ marginLeft: 10, border: "1px solid white" }} />
                                <Button variant="contained" onClick={handleLogout} style={{ marginLeft: 10, right: 0, border: "1px solid white" }}>
                                    Đăng xuất
                                </Button> */}

                                <IconButton onClick={handleMenuOpen}>
                                    <Avatar alt={user.username} src={user.avatar} style={{ border: "1px solid white" }} />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleProfile}>Profile</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </>
                        )}
                    </Toolbar>
                </AppBar>
            </div>

            <Drawer
                anchor='left'
                open={drawerOpen}
                onClose={toggleDrawer(false)}
            >
                {list()}
            </Drawer>
        </div>

            <Box sx={{ margin: 2 }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#FF5722' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Sản phẩm</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Đơn giá</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Số lượng</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Số tiền</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {carts.length > 0 ? (
                                carts.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={c.selected}
                                                    onChange={() => selectCartItem(c.id)}
                                                />
                                                <img src={c.product.image} alt={c.product.name} style={{ width: 80, height: 80, marginRight: 16 }} />
                                                <Typography>{c.product.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{c.product.price.toLocaleString()}₫</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => updateCartItemQuantity(c.id, c.quantity - 1)} disabled={c.quantity === 1}>
                                                <Remove />
                                            </IconButton>
                                            <Typography display="inline">{c.quantity}</Typography>
                                            <IconButton onClick={() => updateCartItemQuantity(c.id, c.quantity + 1)}>
                                                <Add />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>
                                            {(c.product.price * c.quantity).toLocaleString()}₫
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => deleteCartItem(c.id)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No items in the cart.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {carts.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        <Typography variant="h6">
                            Tổng thanh toán: <span style={{ color: 'red', fontWeight: 'bold' }}>{calculateTotal().toLocaleString()}₫</span>
                        </Typography>
                        <Button onClick={checkout} variant="contained" color="primary">
                            Mua hàng
                        </Button>
                    </Box>
                )}
            </Box>
        </>
    );
};

export default Cart;
