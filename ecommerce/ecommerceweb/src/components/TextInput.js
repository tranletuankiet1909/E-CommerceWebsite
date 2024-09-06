import React from 'react';
import TextField from '@mui/material/TextField';

const TextInput = ({ label, value, onChange, type, icon }) => {
    return (
        <TextField
            label={label}
            value={value}
            onChange={onChange}
            type={type || 'text'}
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
                endAdornment: icon,
            }}
        />
    );
};

export default TextInput;
