import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Avatar, List, ListItem, ListItemText, Tabs, Tab, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Contexts from '../configs/Contexts';

const Orders = () => {
    const { state } = useContext(Contexts);
    const user = state?.user;
    const [orders, setOrders] = useState([]);
    const [tabValue, setTabValue] = useState(0);

    const navigate = useNavigate();

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

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (!user) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar */}
            <Box sx={{ width: 250, bgcolor: '#f5f5f5', padding: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'gray', marginRight: 1 }}>
                        {user.username[0].toUpperCase()}
                    </Avatar>
                    <Typography>{user.username}</Typography>
                </Box>
                <List>
                    <ListItem>
                        <ListItemText primary="Tài khoản của tôi" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Đơn mua" sx={{ color: 'red' }} />
                    </ListItem>
                </List>
            </Box>

            {/* Main content */}
            <Box sx={{ flexGrow: 1, padding: 3 }}>
                <Typography variant="h5" sx={{ marginBottom: 2 }}>Đơn hàng của bạn</Typography>

                {/* Tabs */}
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="order tabs">
                    <Tab label="Tất cả" />
                    <Tab label="Chờ xử lý" />
                    <Tab label="Đang xử lý" />
                    <Tab label="Hoàn thành" />
                </Tabs>

                {/* Orders List */}
                <Grid container spacing={2} sx={{ marginTop: 2 }}>
                    {orders.map((order) => (
                        <Grid item xs={12} key={order.id}>
                            <Card>
                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h6">{order.store_name}</Typography>
                                        <Typography variant="body1">{order.product_name}</Typography>
                                        <Typography variant="body2">Ngày đặt hàng: {new Date(order.created_date).toLocaleDateString()}</Typography>
                                        <Typography variant="body2">Số lượng: {order.quantity}</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'red' }}>
                                            Tổng tiền: {order.total_price}₫
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Button variant="outlined" color="primary" sx={{ marginRight: 1 }}>
                                            Chat ngay
                                        </Button>
                                        <Button variant="outlined" color="secondary">
                                            Xem shop
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default Orders;