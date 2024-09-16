import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Typography, CircularProgress, Button, Box, AppBar, Toolbar, IconButton, Avatar, Menu, MenuItem, ListItem, ListItemText, List, Drawer } from '@mui/material';
import Item from '../components/Item';
import Contexts from '../configs/Contexts';
import MenuIcon from '@mui/icons-material/Menu';

const StoreDetails = () => {
    const { id } = useParams();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    // const [newRating, setNewRating] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const { state, dispatch } = useContext(Contexts);
    const user = state.user;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await axios.get(`/stores/`);
                const storeData = res.data.find(store => store.id.toString() === id);
                if (storeData) {
                    setStore(storeData);
                } else {
                    setError('Cửa hàng không tồn tại.');
                }
            } catch (ex) {
                setError('Không thể tải thông tin cửa hàng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        const fetchProducts = async () => {
            try {
                const res = await axios.get(`/stores/${id}/products/`);
                setProducts(res.data.results);
            } catch (ex) {
                setError('Không thể tải sản phẩm của cửa hàng. Vui lòng thử lại sau.');
            }
        };

        fetchStore();
        fetchProducts();
    }, [id]);

    if (loading) return <div>Đang tải... <CircularProgress /></div>;
    if (error) return <div>{error}</div>;

    const handleLogin = () => {
        navigate('/login/');
    };

    const handleRegister = () => {
        navigate('/register/');
    };

    const handleLogout = () => {
        dispatch({
            type: 'logout',
        });
        navigate('/');
    }; const toggleDrawer = (open) => (event) => {
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
                <ListItem button onClick={() => navigate('/carts/')}>
                    <ListItemText primary="Giỏ hàng" />
                </ListItem>
                <ListItem button onClick={() => navigate('/orders/')}>
                    <ListItemText primary="Đơn hàng" />
                </ListItem>
            </List>
        </Box>
    );

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        navigate('/profile/');
    };

    return (
        <div>
            <AppBar style={{ marginBottom: 5 }} position="static">
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
                    <Box sx={{ flexGrow: 1 }}>
                        <Button onClick={() => navigate('/')} color="inherit">
                            <Typography variant="h6" component="div">
                                ECOMMERCE
                            </Typography>
                        </Button>
                    </Box>
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
            <Drawer
                anchor='left'
                open={drawerOpen}
                onClose={toggleDrawer(false)}
            >
                {list()}
            </Drawer>
            <Container>
                <Card style={{ marginTop: '20px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <img
                            src={store.image}
                            alt="Logo cửa hàng"
                            style={{
                                width: 100,
                                height: 100,
                                border: '2px solid #000',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginBottom: 10
                            }}
                        />
                        <Typography variant="h6" style={{ fontWeight: 'bold' }}>{store.name}</Typography>
                        <Button variant="contained" color="warning" style={{ marginTop: 10 }}>
                            Chat ngay
                        </Button>
                    </Box>

                    <Box textAlign="right">
                        <Typography variant="body1"><strong>Email:</strong> {store.email}</Typography>
                        <Typography variant="body1"><strong>Địa chỉ:</strong> {store.address}</Typography>
                        <Typography variant="body1"><strong>Số điện thoại:</strong> {store.phone_number}</Typography>
                    </Box>
                </Card>

                <Typography variant="h6" style={{ marginTop: '30px', textAlign: 'center', fontWeight: 'bold' }}>SẢN PHẨM CỦA CỬA HÀNG</Typography>

                <div className="products-grid">
                    {products.map((item) => (
                        <Item key={item.id} instance={item} />
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default StoreDetails;