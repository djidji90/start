// src/shim.js
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Forzar que React sea global
window.React = React;
window.ReactDOM = ReactDOM;

export { React, ReactDOM };