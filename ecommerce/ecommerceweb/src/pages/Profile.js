import React, { useState, useContext } from 'react';
import { AppBar, Toolbar, Drawer, IconButton, Typography, Avatar, Menu, MenuItem, Box, Button, Grid, TextField, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Contexts from '../configs/Contexts';
import MenuIcon from '@mui/icons-material/Menu';

const Profile = () => {
  const { state, dispatch } = useContext(Contexts);
  const user = state.user;
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stores] = useState([]);

  const [userData, setUserData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    birth: user?.birth || '',
    username: user?.username || '',
  });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogin = () => {
        navigate('/login/');
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

  const handleRegister = () => {
        navigate('/register/');
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

  const handleOrders = () => {
    navigate('/orders/');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleChange = (name, value) => {
    setUserData({ ...userData, [name]: value });
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
      <Box sx={{ display: 'flex', height: '100vh', padding: '0 24px' }}>
        <Box
          sx={{
            width: 250,
            bgcolor: '#f5f5f5',
            p: 2,
          }}
        >
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
              <Button variant="contained" fullWidth sx={{ mt: 2 }}>
              CHỈNH SỬA
            </Button>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, p: 5 }}>
          <Typography variant="h4" sx={{ color: '#f44336', mb: 4 }}>
            HỒ SƠ CỦA TÔI
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="Họ và tên lót"
                fullWidth
                value={userData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Tên"
                fullWidth
                value={userData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email"
                fullWidth
                value={userData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Ngày sinh"
                fullWidth
                value={userData.birth}
                onChange={(e) => handleChange('birth', e.target.value)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Tên đăng nhập"
                fullWidth
                value={userData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default Profile;
