import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Item from '../components/Item';
import '../styles/MyStyles.css'; // Import đúng đường dẫn
import { useNavigate } from 'react-router-dom';
import Contexts from '../configs/Contexts';
import { AppBar, Avatar, Box, Button, Drawer, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]); // State to store fetched stores
    const theme = useTheme(); // Sử dụng theme
    console.log("theme", theme); // Log theme để kiểm tra giá trị
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [q, setQ] = useState('');
    const [cateId, setCateId] = useState('');
    const [sort, setSort] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [error, setError] = useState(null);
    const searchInputRef = useRef(null);
    const [drawerOpen, setDrawerOpen] = useState(false); // State for Drawer
    const [anchorEl, setAnchorEl] = useState(null); // State for Menu
    const { state, dispatch } = useContext(Contexts);
    const user = state.user;

    const navigate = useNavigate();

    useEffect(() => {
        const loadCate = async () => {
            try {
                let res = await axios.get('/categories/');
                console.log('Categories:', res.data); // Log dữ liệu categories
                setCategories(res.data);
            } catch (ex) {
                console.error(ex);
                setError('Không thể tải danh mục. Vui lòng thử lại sau.');
            }
        };
        loadCate();

        const loadStores = async () => {
            try {
                let res = await axios.get(`/stores/`);
                setStores(res.data);
            } catch (ex) {
                console.error(ex);
                setError('Không thể tải cửa hàng. Vui lòng thử lại sau.');
            }
        };
        loadStores();
    }, []);

    const loadPro = async () => {
        if (page > 0 && !loading) {
            let url = `/products?q=${q}&category_id=${cateId}&page=${page}`;
            try {
                setLoading(true);
                let res = await axios.get(url);
                console.log('Products:', res.data.results); // Log dữ liệu products
                let loadedProducts = res.data.results;

                if (sort === 'name') {
                    loadedProducts = loadedProducts.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sort === 'priceLowToHigh') {
                    loadedProducts = loadedProducts.sort((a, b) => a.price - b.price);
                } else if (sort === 'priceHighToLow') {
                    loadedProducts = loadedProducts.sort((a, b) => b.price - a.price);
                }
                if (page === 1) setProducts(loadedProducts);
                else if (page > 1) {
                    setProducts((current) => [...current, ...loadedProducts]);
                }
                if (res.data.next === null) setPage(0);
            } catch (ex) {
                console.error(ex);
                setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        }
    };

    const debouncedLoadPro = useCallback(debounce(loadPro, 300), [q, cateId, page, sort]);

    useEffect(() => {
        debouncedLoadPro();
        return debouncedLoadPro.cancel;
    }, [q, cateId, page, sort]);

    const handleCategorySelect = (categoryId) => {
        setCateId(categoryId);
        setPage(1);
    };

    const handleSortChange = (sortOrder) => {
        setIsModalVisible(false);
        setSort(sortOrder);
        setPage(1);
    };

    const handleTouchFilter = () => {
        setIsModalVisible(true);
        if (searchInputRef.current) {
            searchInputRef.current.blur();
        }
    };

    const loadMore = () => {
        if (!loading && page !== 0) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const search = (value) => {
        setPage(1);
        setQ(value);
    };

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
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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

    const handleProfile = () => {
        navigate('/profile/');
    };

    return (

        <div className="home-container">
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
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
            <Drawer
                anchor='left'
                open={drawerOpen}
                onClose={toggleDrawer(false)}
            >
                {list()}
            </Drawer>
            {error && <div className="error">{error}</div>}
            <div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        value={q}
                        onChange={(e) => search(e.target.value)}
                        ref={searchInputRef}
                    />
                    <div style={{ margin: 5 }}>
                        <button onClick={handleTouchFilter}>Lọc</button>
                    </div>
                </div>
                <div className="category-chips">
                    <button
                        className={!cateId ? 'chip active' : 'chip'}
                        onClick={() => handleCategorySelect('')}
                    >
                        Tất cả
                    </button>
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            className={cateId === c.id ? 'chip active' : 'chip'}
                            onClick={() => handleCategorySelect(c.id)}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="products-grid">
                {products.map((item) => (
                    <Item key={item.id} instance={item} />
                ))}
            </div>
            {loading && <div className="loading">Đang tải...</div>}
            {page !== 0 && !loading && (
                <button className="load-more" onClick={loadMore}>Tải thêm</button>
            )}

            {isModalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <button onClick={() => handleSortChange('name')}>Sắp xếp theo tên</button>
                        <button onClick={() => handleSortChange('priceLowToHigh')}>Sắp xếp giá từ thấp đến cao</button>
                        <button onClick={() => handleSortChange('priceHighToLow')}>Sắp xếp giá từ cao xuống thấp</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;