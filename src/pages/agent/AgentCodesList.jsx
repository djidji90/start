// src/pages/agent/AgentCodesList.jsx
// ✅ Lista de códigos generados por el agente

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Typography,
  Pagination,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search, ContentCopy, CheckCircle, QrCode } from '@mui/icons-material';
import { getAuthToken } from '../../components/hook/services/apia';

const AgentCodesList = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchCodes = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`https://api.djidjimusic.com/wallet/agent/codes/?page=${page}&page_size=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al cargar códigos');

      const data = await response.json();
      setCodes(data.codes || []);
      setPagination({
        page: data.pagination?.page || page,
        totalPages: data.pagination?.total_pages || 1,
        total: data.pagination?.total || 0
      });
    } catch (err) {
      console.error('Error fetching codes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handlePageChange = (event, newPage) => {
    fetchCodes(newPage);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCodes = codes.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && codes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por código..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          )
        }}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell>Código</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Expira</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No hay códigos generados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCodes.map((code) => (
                <TableRow key={code.code}>
                  <TableCell>
                    <Typography fontFamily="monospace" variant="body2">
                      {code.code}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      {new Intl.NumberFormat().format(code.amount)} {code.currency}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={code.is_used ? 'Usado' : 'Activo'}
                      size="small"
                      color={code.is_used ? 'default' : 'success'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="caption" color="text.secondary">
                      {new Date(code.expires_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Copiar código">
                      <IconButton size="small" onClick={() => handleCopyCode(code.code)}>
                        {copiedCode === code.code ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver QR">
                      <IconButton size="small" href={code.qr_url} target="_blank">
                        <QrCode fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default AgentCodesList;