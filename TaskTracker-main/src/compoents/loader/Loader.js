import React from 'react';
import { Spin } from 'antd';
import './loader.scss'; // Optional: for custom styles

const Loader = () => (
    <div className="loader-overlay">
        <Spin tip="Loading..." fullscreen/>
    </div>
);

export default Loader;
