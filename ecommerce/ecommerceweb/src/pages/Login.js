import React, { useState, useCallback, useContext } from 'react';
import { useHistory, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Container, Typography, Link, Alert } from '@mui/material';
import TextInput from '../components/TextInput';
import axios from 'axios';
import Contexts from '../configs/Contexts';
//import Contexts from '../../configs/Contexts';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    //const history = useHistory();
    //const contextValue = useContext(Contexts);
    //const [user, dispatch] = contextValue || [{}, () => { }];
    const [success, setSuccess] = useState('');
    const { state, dispatch } = useContext(Contexts);

    const navigate = useNavigate();

    const onRefresh = useCallback(() => {
        setUsername('');
        setPassword('');
        setError('');
        setSuccess('');
    }, []);

    const login = async () => {
        if (username === '' || password === '') {
            setError('Tên đăng nhập và mật khẩu không được để trống.');
            return;
        }
        setLoading(true);
        try {
            let res = await axios.post(`/o/token/`, {
                username: username,
                password: password,
                client_id: 'lEnIa3wMV85V09cKCHoYkAmR2gzQYuPtAcykH51x',
                client_secret: 'Fz00b53Cmk5A5yla0QkVbuudoAbpBoubmxlaUPTYeVfCPQJt8tg3uNfKfpbiUTm5bnNG66ylbiyEMWvRcx9tMi8lZSrn51QbCyV8mu64n8hs3rNhuSNwfbVmiY9YLHHR',
                grant_type: 'password',
            },{
                headers: {
        '           Content-Type': 'multipart/form-data',
                }
            });

            localStorage.setItem('access-token', res.data.access_token);
            setTimeout(async () => {
                let userRes = await axios.get(`/users/current-user/`, {
                    headers: { Authorization: `Bearer ${res.data.access_token}` },
                });

                //const userData = user.data || [];
                const userData = userRes.data;

                dispatch({
                    type: 'login',
                    //payload: Array.isArray(userData) ? userData : [],
                    payload: userData,
                });

                setSuccess('Đăng nhập thành công!');
                setTimeout(() => {
                    navigate('/');
                }, 2000); // Đợi 2 giây rồi chuyển hướng


            }, 100);
        } catch (ex) {
            console.log(ex);
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={8} textAlign="center">
                <Typography variant="h4" color="#041E42" fontWeight="bold">
                    ECOMMERCE APP
                </Typography>
                <Typography variant="h5" color="#041E42" fontWeight="bold" mt={2}>
                    ĐĂNG NHẬP
                </Typography>
            </Box>

            <Box mt={4}>
                <TextInput
                    label="Tên đăng nhập..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                // icon={<i className="material-icons">account_circle</i>}
                />
                <TextInput
                    label="Mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                // icon={<i className="material-icons">visibility</i>}
                />
                {error && (
                    <Typography color="error" mt={2}>
                        {error}
                    </Typography>
                )}

                {success && (
                    <Alert severity="success" mt={2}>
                        {success}
                    </Alert>
                )}

                <Typography color="primary" fontWeight="500" mt={2}>
                    Quên mật khẩu?
                </Typography>
            </Box>

            <Box mt={4} textAlign="center">
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Button variant="contained" color="primary" onClick={login}>
                        Đăng nhập
                    </Button>
                )}
            </Box>

            <Box mt={2} textAlign="center">
                <Link href="/register/" variant="body2">
                    Chưa có tài khoản? Đăng ký tại đây
                </Link>
            </Box>
        </Container>
    );
};

export default Login;