"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
var axios_1 = require("axios");
exports.api = axios_1.default.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Interceptor para manejar errores globalmente
exports.api.interceptors.response.use(function (response) { return response; }, function (error) {
    var _a, _b;
    var errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Error de conexión';
    return Promise.reject(new Error(errorMessage));
});
