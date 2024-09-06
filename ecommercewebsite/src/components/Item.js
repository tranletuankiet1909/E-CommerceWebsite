import React from 'react';
import '../styles/MyStyles.css';
import { useNavigate } from 'react-router-dom';

const Item = ({ instance }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/product/${instance.id}`);
    };

    return (
        <div className="item" onClick={handleClick}>
            <img src={instance.image} alt={instance.name} />
            <h3>{instance.name}</h3>
            <p>{instance.price}</p>
        </div>
    );
};

export default Item;