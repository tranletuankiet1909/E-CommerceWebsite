import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
//import "./Register.css"; // Tạo file CSS cho các style của bạn
import '../styles/MyStyles.css';
import { useNavigate } from "react-router-dom";

const Register = () => {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const navigate = useNavigate();

    const fields = [
        { label: "Họ và tên lót", name: "last_name" },
        { label: "Tên", name: "first_name" },
        { label: "Email", name: "email" },
        { label: "Ngày Sinh", name: "birth" },
        { label: "Địa chỉ", name: "address" },
        { label: "Tên đăng nhập", name: "username" },
        { label: "Mật khẩu", name: "password" },
        { label: "Xác nhận mật khẩu", name: "confirm" }
    ];

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    const roleOptions = [
        { value: 'ADMIN', label: 'Admin' },
        { value: 'STAFF', label: 'Staff' },
        { value: 'SELLER', label: 'Seller' },
        { value: 'BUYER', label: 'Buyer' }
    ];

    const printFormData = (formData) => {
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
    };

    const onSubmit = async data => {
        setErr("");
        setLoading(true);

        if (data.password !== data.confirm) {
            setErr("Mật khẩu không khớp");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        // for (let key in data) {
        //     formData.append(key, data[key]);
        // }

        // Append normal fields
        for (let key in data) {
            if (key === 'avatar' && data[key].length > 0) {
                formData.append(key, data[key][0]); // Append the file itself
            } else if (key === 'gender' || key === 'role') {
                formData.append(key, data[key].value); // Append the value property
            } else if (key === 'birth') {
                const formattedDate = data[key].toISOString().split('T')[0]; // Format date as yyyy-MM-dd
                formData.append(key, formattedDate);
            } else if (key !== 'confirm') {
                formData.append(key, data[key]);
            }
        }

        printFormData(formData);

        try {
            const response = await axios.post(`/users/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            //console.log("Data", formData)

            if (response.status === 201) {
                navigate('/login/')// Chuyển hướng đến trang đăng nhập
            } else {
                setErr("Đăng ký thất bại");
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // setErr("Tên đăng nhập đã tồn tại");
                setErr(error.response.data.message || "Tên đăng nhập đã tồn tại");
            } else {
                setErr("Có lỗi xảy ra, vui lòng thử lại");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>ECOMMERCE APP</h2>
            <h3>ĐĂNG KÝ NGƯỜI DÙNG</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
                {fields.map(field => (
                    <div key={field.name} className="form-group">
                        <label>{field.label}</label>
                        {field.name === "birth" ? (
                            <Controller
                                control={control}
                                name="birth"
                                render={({ field }) => (
                                    <DatePicker
                                        selected={field.value}
                                        onChange={field.onChange}
                                        dateFormat="yyyy-MM-dd"
                                        className="form-control"
                                    />
                                )}
                            />
                        ) : (
                            <input
                                type={field.name.includes("password") ? "password" : "text"}
                                {...register(field.name, { required: `Vui lòng nhập ${field.label}` })}
                                className="form-control"
                            />
                        )}
                        {errors[field.name] && <p className="error-message">{errors[field.name].message}</p>}
                    </div>
                ))}
                <div className="form-group">
                    <label>Chọn ảnh đại diện</label>
                    <input type="file" {...register("avatar")} className="form-control" />
                </div>
                <div className="form-group">
                    <label>Giới tính</label>
                    <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={genderOptions}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        )}
                    />
                </div>
                <div className="form-group">
                    <label>Vai trò người dùng</label>
                    <Controller
                        control={control}
                        name="role"
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={roleOptions}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        )}
                    />
                </div>
                {err && <p className="error-message">{err}</p>}
                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
            </form>
        </div>
    );
};

export default Register;
