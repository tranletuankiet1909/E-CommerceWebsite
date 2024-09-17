import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { Container, TextField, CardContent, CardMedia, Typography, Button, Box, AppBar, Toolbar, IconButton, Avatar, Menu, MenuItem, Drawer, List, ListItem, ListItemText, Divider, Rating, Card } from '@mui/material';
import Contexts from '../configs/Contexts';
import MenuIcon from '@mui/icons-material/Menu';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState();
    const [showComments, setShowComments] = useState(true); // State to toggle comments and ratings
    const [showRatings, setShowRatings] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [cartMessage, setCartMessage] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false); // State for Drawer
    const [anchorEl, setAnchorEl] = useState(null); // State for Menu
    const { state, dispatch } = useContext(Contexts);
    const user = state.user;

    const navigate = useNavigate();
    const token = localStorage.getItem('access-token');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`/products/${id}`);
                setProduct(res.data);
            } catch (ex) {
                setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const loadRatings = async () => {
        try {
            // Gọi API và nhận phản hồi
            let res = await axios.get(`/products/${id}/ratings`);

            // Trích xuất dữ liệu từ phản hồi
            let data = res.data;

            // Kiểm tra xem results có phải là mảng không
            let ratingsArray = Array.isArray(data.results) ? data.results : [data.results];
            setRatings(ratingsArray);
        } catch (ex) {
            console.error('Error fetching comments:', ex);
            setRatings([]);
        }
    };

    const loadComments = async () => {
        try {
            let res = await axios.get(`/products/${id}/comments`);
            let data = res.data;
            let commentsArray = Array.isArray(data.results) ? data.results : [data.results];
            const nestedComments = nestComments(commentsArray);
            setComments(nestedComments);
        } catch (ex) {
            console.error('Error fetching comments:', ex);
            setComments([]);
        }

    };

    const nestComments = (comments) => {
        const commentMap = new Map();
        comments.forEach(comment => commentMap.set(comment.id, { ...comment, replies: [] }));
        const nestedComments = [];
        commentMap.forEach(comment => {
            if (comment.parent === null) {
                nestedComments.push(comment);
            } else {
                const parentComment = commentMap.get(comment.parent);
                if (parentComment) {
                    parentComment.replies.push(comment);
                }
            }
        });
        return nestedComments;
    };

    useEffect(() => {
        loadRatings();
    }, [id, ratings])

    useEffect(() => {
        loadComments();
    }, [id, comments]);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const res = await axios.post(`/products/${id}/add-comment/`, { content: newComment }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 201) {
                setNewComment('');
                loadComments();
            }
        } catch (ex) {
            console.error('Error adding comment:', ex);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const res = await axios.delete(
                `/comments/${commentId}/`,
                { headers: { Authorization: `Bearer ${token}` } } // Include the token in the headers
            );
            if (res.status === 204) {
                loadComments();
            }
        } catch (ex) {
            console.error('Error deleting comment:', ex);
        }
    };

    const handleAddRating = async () => {
        try {
            const res = await axios.post(`/products/${id}/add-rating/`, { rating: newRating }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 201) {
                setNewRating(0);
                loadRatings();
            }
        } catch (ex) {
            console.error('Error adding rating:', ex);
        }
    };

    const handleDeleteRating = async (ratingId) => {
        try {
            const res = await axios.delete(
                `/ratings/${ratingId}/`,
                { headers: { Authorization: `Bearer ${token}` } } // Include the token in the headers
            );
            if (res.status === 204) {
                loadRatings();
            }
        } catch (ex) {
            console.error('Error deleting rating:', ex);
        }
    };

    const handleAddToCart = async () => {
        try {
            const res = await axios.post(`/carts/1/add_to_cart/`, { product_id: id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 200) {
                setCartMessage('Thêm vào giỏ hàng thành công');
                setTimeout(() => setCartMessage(''), 3000);
            }
        } catch (ex) {
            console.error('Error adding to cart:', ex);
        }
    };

    const renderComments = (comments, level = 0) => {
        return comments.map(c => (
            <div key={c.id} style={{ marginLeft: level * 50, marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={c.buyer.avatar} alt={c.buyer.username} style={{ width: 50, height: 50, borderRadius: '50%', marginRight: 10 }} />
                    <div>
                        <Typography variant="body2" style={{ fontStyle: "italic", fontWeight: "bold" }}>{c.buyer.username}</Typography>
                        <Typography variant="body2">{c.content}</Typography>
                        <Typography variant="body2">{moment(c.created_date).fromNow()}</Typography>
                    </div>
                    {user && user.id === c.buyer.id ? <>
                        <Button color="secondary" onClick={() => handleDeleteComment(c.id)}>Xóa</Button>
                    </> : <></>}

                </div>
                {c.replies && renderComments(c.replies, level + 1)}
            </div>
        ));
    };

    const renderRatings = (ratings) => {
        return ratings.map(r => (
            <div key={r.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={r.buyer.avatar} alt={r.buyer.username} style={{ width: 50, height: 50, borderRadius: '50%', marginRight: 10 }} />
                    <div>
                        <Typography variant="body2" style={{ fontStyle: "italic", fontWeight: "bold" }}>{r.buyer.username}</Typography>
                        <Rating value={r.rating} readOnly precision={0.5} />
                        {/* <Typography variant="body2">{r.comment}</Typography> */}
                        <Typography variant="body2">{moment(r.created_date).fromNow()}</Typography>
                    </div>
                    {user && user.id === r.buyer.id ? <>
                        <Button color="secondary" onClick={() => handleDeleteRating(r.id)}>Xóa</Button>
                    </> : <></>}
                </div>
            </div>
        ));
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

    if (loading || !product) return <div>Đang tải...</div>;

    return (
        <div>
            <AppBar style={{ marginBottom: 5 }} position="static">
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={toggleDrawer(true)}>
                        <MenuIcon style={{ color: "white" }} />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}>
                        <Button onClick={() => navigate('/')} color="inherit">
                            <Typography variant="h6" component="div">ECOMMERCE</Typography>
                        </Button>
                    </Box>
                    {!user ? (
                        <>
                            <Button variant="contained" color="primary" onClick={() => navigate('/login/')} style={{ marginLeft: 10, border: "1px solid white" }}>Đăng nhập</Button>
                            <Button variant="contained" color="secondary" onClick={() => navigate('/register/')} style={{ marginLeft: 10, border: "1px solid white" }}>Đăng ký</Button>
                        </>
                    ) : (
                        <>
                            <IconButton onClick={handleMenuOpen}>
                                <Avatar alt={user.username} src={user.avatar} style={{ border: "1px solid white" }} />
                            </IconButton>
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer anchor='left' open={drawerOpen} onClose={toggleDrawer(false)}>
                {list()}
            </Drawer>

            <Container>
                <Card sx={{ display: 'flex', padding: 2, marginBottom: 3 }}>
                    <CardMedia component="img" style={{ width: 150, height: 150, marginRight: 20 }} image={product.image} />
                    <Box>
                        <Typography variant="h5">{product.name}</Typography>
                        <Typography variant="body2" color="textSecondary">10.2k đánh giá</Typography>
                        <Typography variant="h6" color="error" sx={{ margin: '10px 0' }}>{product.price}đ</Typography>
                        <Typography variant="body2">Số lượng tồn: {product.inventory_quantity}</Typography>
                        <Button variant="contained" color="primary" onClick={handleAddToCart} sx={{ marginTop: 2 }}>Thêm vào giỏ hàng</Button>
                        {cartMessage && <Typography variant="body2" color="success" sx={{ marginTop: 1 }}>{cartMessage}</Typography>}
                    </Box>
                </Card>

                {product.store && (
                    <Card>
                        <CardContent>
                            <Button onClick={() => navigate(`/store/${product.store.id}`)}>
                                <img src={product.store.image} alt={product.store.name} style={{ width: 50, height: 50, borderRadius: '50%', marginRight: 10 }} />
                                <Typography variant="h6">{product.store.name}</Typography>
                                {/* <Typography variant="body6">{product.store.address}</Typography> */}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Card sx={{ padding: 2, marginBottom: 3 }}>
                    <Typography variant="h6" sx={{ textAlign: "center", color:"red", marginBottom: 2 }}><b>MÔ TẢ SẢN PHẨM</b></Typography>
                    <Typography variant="body2" dangerouslySetInnerHTML={{ __html: product.description }}></Typography>
                </Card>

                <Card sx={{ padding: 2 }}>
                    <Typography variant="h6" sx={{ textAlign: "center", color:"red", marginBottom: 2 }}><b>ĐÁNH GIÁ SẢN PHẨM</b></Typography>
                    <Box display="flex" justifyContent="flex-start" gap={2}>
                        <Button variant={showComments ? "contained" : "outlined"} onClick={() => { setShowComments(true); setShowRatings(false); }}>Xem bình luận</Button>
                        <Button variant={showRatings ? "contained" : "outlined"} onClick={() => { setShowComments(false); setShowRatings(true); }}>Xem đánh giá</Button>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    {showComments && (
                        <>
                            <Typography variant="h6">Phản hồi người dùng</Typography>
                            {user && (
                                <Box display="flex" alignItems="center">
                                    <TextField
                                        label="Nội dung bình luận"
                                        fullWidth
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <Button onClick={handleAddComment}>Bình luận</Button>
                                </Box>
                            )}
                            <div>{renderComments(comments)}</div>
                        </>
                    )}
                    {showRatings && (
                        <>
                            <Typography variant="h6">Đánh giá người dùng</Typography>
                            {user && (
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Rating
                                        value={newRating}
                                        onChange={(event, newValue) => setNewRating(newValue)}
                                        precision={1}
                                    />
                                    <Button onClick={handleAddRating}>Đánh giá</Button>
                                </Box>
                            )}
                            <div>{renderRatings(ratings)}</div>
                        </>
                    )}
                </Card>
            </Container>
        </div>
    );
};

export default ProductDetails;
