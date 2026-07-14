import React from 'react';
import './Spinner.css';

export default function Spinner({ size = 'sm', color = 'white' }) {
  return (
    <div className={`custom-spinner spinner-${size} spinner-${color}`}></div>
  );
}
