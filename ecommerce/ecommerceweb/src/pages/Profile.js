import React, { useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Card, CardMedia, TextField, Typography, MenuItem, Menu, IconButton, List, ListItem, ListItemText, AppBar, Toolbar, Drawer } from '@mui/material';
//import DatePicker from '@mui/lab/DatePicker';
//import { Contexts } from '../../configs/Contexts';
import axios from 'axios';
//import mime from 'mime';
//import { ImagePicker } from 'react-image-picker';
//import 'react-image-picker/dist/index.css';
import Contexts from '../configs/Contexts';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import DatePicker from 'react-datepicker';
//import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MenuIcon from '@mui/icons-material/Menu';

const Profile = () => {
    const { state, dispatch } = useContext(Contexts);
    const user = state.user;
    const [isEditable, setIsEditable] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [stores, setStores] = useState([]);
    const userStore = stores.find(store => store.owner === user.id);
    const [storeStatus, setStoreStatus] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false); // State for Drawer
    const [anchorEl, setAnchorEl] = useState(null); // State for Menu

    const navigate = useNavigate();

    useEffect(() => {
        const checkStoreStatus = async () => {
            try {
                let res = await axios.get('/api/stores');
                let stores = res.data;
                stores.map(store => {
                    if (store.owner === user.id)
                        setStoreStatus(store.active);
                });
            } catch (ex) {
                console.error(ex);
            }
        };

        const loadStores = async () => {
            try {
                let res = await axios.get('/api/stores');
                setStores(res.data);
            } catch (ex) {
                console.error(ex);
            }
        };

        checkStoreStatus();
        loadStores();
    }, [user.id]);

    const [userData, setUserData] = useState({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        address: user.address,
        birth: user.birth,
        email: user.email,
        avatar: user.avatar,
    });

    const fields = [
        { label: 'username', value: userData.username, icon: 'account', fieldName: 'username' },
        { label: 'email', value: userData.email, icon: 'mail', fieldName: 'email' },
        { label: 'Tên', value: userData.first_name, icon: 'account', fieldName: 'first_name' },
        { label: 'Họ và tên lót', value: userData.last_name, icon: 'account', fieldName: 'last_name' },
        { label: 'Địa chỉ', value: userData.address, icon: 'map', fieldName: 'address' },
        { label: 'Ngày sinh', value: userData.birth, icon: 'calendar', fieldName: 'birth' },
    ];

    const handleChange = (name, value) => {
        setUserData({ ...userData, [name]: value });
    };

    const handleEdit = () => {
        setIsEditable(true);
    };

    // const picker = async () => {
    //     let res = await ImagePicker.pick({ multiple: false });
    //     if (res.length > 0) {
    //         handleChange("avatar", res[0]);
    //     }
    // };

    // const toggleDatePicker = () => {
    //     if (isEditable) {
    //         setShowPicker(!showPicker);
    //     }
    // };

    const formatDate = (rawDate) => {
        let date = new Date(rawDate);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        return `${year}-${month}-${day}`;
    };

    const onChange = (date) => {
        setDate(date);
        handleChange("birth", formatDate(date));
    };

    // const handleSave = async () => {
    //     try {
    //         let token = localStorage.getItem('access-token');

    //         const formData = new FormData();
    //         for (const key in userData) {
    //             if (key === 'avatar' && userData.avatar.uri !== undefined) {
    //                 formData.append(key, {
    //                     uri: userData.avatar.uri,
    //                     name: userData.avatar.fileName || userData.avatar.uri.split('/').pop(),
    //                     type: mime.getType(userData.avatar.uri)
    //                 });
    //             } else {
    //                 formData.append(key, userData[key]);
    //             }
    //         }

    //         let response = await axios.patch('https://tuankiet.pythonanywhere.com/users/current-user/', formData, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //                 'Content-Type': 'multipart/form-data',
    //             },
    //         });

    //         if (response.status === 200) {
    //             setIsEditable(false);
    //             alert("Profile updated successfully");
    //         } else {
    //             alert(`Failed to update profile: ${response.statusText}`);
    //         }
    //     } catch (error) {
    //         console.error("An error occurred:", error);
    //         alert(`An error occurred while updating profile: ${error.message}`);
    //     }
    // };

    // if (!user) {
    //     return <Typography>No user logged in</Typography>;
    // }

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
                {/* {['Giỏ hàng', 'Đơn hàng'].map((text, index) => (
                    <ListItem button key={text} onClick={() => navigate(`/${text.toLowerCase().replace(' ', '-')}`)}>
                        <ListItemText primary={text} />
                    </ListItem>
                ))} */}

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
            <Drawer
                anchor='left'
                open={drawerOpen}
                onClose={toggleDrawer(false)}
            >
                {list()}
            </Drawer>
            <Box p={2}>
                <Card>
                    <CardMedia
                        component="img"
                        alt="Profile cover"
                        height="140"
                        image={user.avatar}
                        title="Profile cover"
                        style={{ height: 300 }}
                    />
                    <Box display="flex" justifyContent="center" mt={-7}>
                        <Avatar
                            src={userData.avatar && userData.avatar.uri ? userData.avatar.uri : userData.avatar}
                            alt={user.username}
                            sx={{ width: 128, height: 128, border: '3px solid white' }}
                        />
                    </Box>
                </Card>
                {/* {isEditable &&
                <Button variant="text" color="primary" onClick={picker} sx={{ marginTop: 2, textAlign: 'center' }}>
                    Chỉnh sửa ảnh
                </Button>
            } */}
                <Box mt={5}>
                    {fields.map((field, index) => (
                        field.fieldName === 'birth' ? (
                            <Box key={index} mt={2}>
                                <DatePicker
                                    selected={date}
                                    label={field.label}
                                    value={date}
                                    onChange={onChange}
                                    disabled={!isEditable}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </Box>
                        ) : (
                            <TextField
                                key={index}
                                label={field.label}
                                value={field.value}
                                fullWidth
                                margin="normal"
                                InputProps={{
                                    readOnly: !isEditable,
                                }}
                                onChange={(e) => handleChange(field.fieldName, e.target.value)}
                            />
                        )
                    ))}
                </Box>
                {/* <Card sx={{ marginTop: 4, padding: 2 }}>
                <Typography variant="h6" gutterBottom>
                    CHỨC NĂNG
                </Typography>
                {!isEditable && (
                    <>
                        {user.role === 'BUYER' && (
                            <Button variant="outlined" fullWidth onClick={() => navigate('/orders')}>
                                Đơn hàng của bạn
                            </Button>
                        )}
                        {user.role === 'SELLER' && (
                            <>
                                {userStore ? (
                                    !storeStatus ? (
                                        <Typography color="error">Cửa hàng của bạn đang đợi phê duyệt</Typography>
                                    ) : (
                                        <>
                                            <Button variant="outlined" fullWidth onClick={() => navigate(`/register-product/${userStore.id}`)}>
                                                Thêm sản phẩm
                                            </Button>
                                            <Button variant="outlined" fullWidth onClick={() => navigate(`/add-tag`)}>
                                                Thêm tag
                                            </Button>
                                            <Button variant="outlined" fullWidth onClick={() => navigate('/orders')}>
                                                Đơn hàng
                                            </Button>
                                            <Button variant="outlined" fullWidth onClick={() => navigate(`/store-product/${userStore.id}`)}>
                                                Danh sách sản phẩm của cửa hàng
                                            </Button>
                                        </>
                                    )
                                ) : (
                                    <Button variant="outlined" fullWidth onClick={() => navigate('/register-store')}>
                                        Thêm cửa hàng
                                    </Button>
                                )}
                            </>
                        )}
                    </>
                )}
            </Card>
            <Box mt={4}>
                {!isEditable ? (
                    <>
                        <Button variant="contained" fullWidth onClick={handleEdit} sx={{ backgroundColor: 'orange' }}>
                            Chỉnh sửa
                        </Button>
                        <Button variant="contained" fullWidth onClick={() => dispatch({ type: 'logout' })} sx={{ mt: 2 }}>
                            Đăng xuất
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="contained" fullWidth onClick={handleSave} sx={{ backgroundColor: 'green' }}>
                            Lưu
                        </Button>
                        <Button variant="contained" fullWidth onClick={() => setIsEditable(false)} sx={{ mt: 2, backgroundColor: 'red' }}>
                            Hủy
                        </Button>
                    </>
                )}
            </Box> */}
            </Box>
        </div>
    );
};

export default Profile;