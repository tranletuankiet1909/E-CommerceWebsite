import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Drawer, Button, Card, CardContent, Grid, Avatar, List, ListItem, ListItemText, Tabs, Tab, CircularProgress, AppBar, Toolbar, IconButton, Menu, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Contexts from '../configs/Contexts';
import MenuIcon from '@mui/icons-material/Menu';

const Orders = () => {
    const { state, dispatch } = useContext(Contexts);
    const user = state?.user;
    const [orders, setOrders] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null); // Menu anchor
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [stores] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user) {
                try {
                    let token = localStorage.getItem('access-token');
                    let res = await axios.get(`/users/${user.id}/orders/`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setOrders(res.data.results);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                }
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

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

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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

    const handleOrders = () => {
        navigate('/orders');
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

    if (!user) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

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

            {/* Main content */}
            <Box sx={{ display: 'flex', height: '100vh', padding: '0 24px' }}> {/* Sử dụng padding cho Box */}
            <Box
              sx={{
                width: 250,
                bgcolor: '#f5f5f5',
                p: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                E-COMMERCE
              </Typography>
              <Box mt={4}>
                <Avatar alt={user?.username} src={user?.avatar} sx={{ width: 80, height: 80, mx: 'auto' }} />
                <Typography textAlign="center" mt={2}>
                  {user.username}
                </Typography>
                <Box mt={4}>
                  <List>
                    <ListItem button onClick={() => handleProfile()}>
                      <ListItemText primary="Tài khoản của tôi" />
                    </ListItem>
                    <ListItem button onClick={() => handleOrders()}>
                      <ListItemText primary="Đơn mua" />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </Box>

                <Box sx={{ flexGrow: 1, padding: 3 }}>
                    <Typography variant="h4" sx={{ marginBottom: 2 }}>Đơn hàng của bạn</Typography>

                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="order tabs">
                        <Tab label="Tất cả" />
                    </Tabs>

                    <Grid container spacing={2} sx={{ marginTop: 2 }}>
                        {orders.map((order) => (
                            <Grid item xs={12} key={order.id}>
                                <Card>
                                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="h6">{order.store_name}</Typography>
                                            <Typography variant="body1">{order.product_name}</Typography>
                                            <Typography variant="body2">Ngày đặt hàng: {new Date(order.created_date).toLocaleDateString()}</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'red' }}>
                                                Tổng tiền: {order.total_price}₫
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </>
    );
};

export default Orders;
