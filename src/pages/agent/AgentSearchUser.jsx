// src/pages/agent/AgentSearchUser.jsx
// ✅ CON BOTÓN DE BÚSQUEDA CLICABLE

import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,  // ← IMPORTANTE
  Button,      // ← IMPORTANTE
  Card,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField
} from '@mui/material';
import { Search, PersonAdd, Close } from '@mui/icons-material';
import { getAuthToken } from '../../components/hook/services/apia';
import { formatCurrency } from '../../utils/formatters';

const AgentSearchUser = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || query.length < 3) {
      setError('Ingresa al menos 3 caracteres para buscar');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`https://api.djidjimusic.com/wallet/agent/search/?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error en la búsqueda');
      }

      const data = await response.json();
      setResults(data.results || []);
      
      if (data.results?.length === 0) {
        setError(`No se encontraron usuarios con "${query}"`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOpenDeposit = (user) => {
    setSelectedUser(user);
    setDepositAmount('');
    setDepositDialogOpen(true);
  };

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    setDepositing(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch('https://api.djidjimusic.com/wallet/agent/deposit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          amount: parseFloat(depositAmount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al realizar la recarga');
      }

      setDepositSuccess({
        message: `Recarga exitosa de ${formatCurrency(depositAmount)} a ${selectedUser.username}`,
        amount: depositAmount,
        user: selectedUser.username
      });

      setTimeout(() => {
        setDepositDialogOpen(false);
        setDepositSuccess(null);
        // Limpiar resultados después de recargar (opcional)
        setResults([]);
        setQuery('');
      }, 2000);

    } catch (err) {
      console.error('Deposit error:', err);
      setError(err.message);
    } finally {
      setDepositing(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Buscar usuario por email, teléfono o nombre de usuario
      </Typography>

      {/* ✅ CAMPO DE BÚSQUEDA CON BOTÓN */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Ej: romy, macimboleoncio@gmail.com, o teléfono"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={searching || query.length < 3}
          sx={{ minWidth: 100 }}
        >
          {searching ? <CircularProgress size={24} /> : 'Buscar'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {depositSuccess && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setDepositSuccess(null)}>
          ✅ {depositSuccess.message}
        </Alert>
      )}

      {results.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            {results.length} usuario(s) encontrado(s)
          </Typography>
          {results.map((user) => (
            <Card key={user.id} sx={{ p: 1.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {user.full_name || user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {user.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Saldo: {formatCurrency(user.wallet_balance)}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => handleOpenDeposit(user)}
                >
                  Recargar
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Diálogo de recarga */}
      <Dialog open={depositDialogOpen} onClose={() => setDepositDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Recargar saldo
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setDepositDialogOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Usuario: <strong>{selectedUser?.full_name || selectedUser?.username}</strong>
          </Typography>
          <Typography variant="body2" gutterBottom>
            Saldo actual: <strong>{formatCurrency(selectedUser?.wallet_balance || 0)}</strong>
          </Typography>
          <MuiTextField
            fullWidth
            type="number"
            label="Monto a recargar (XAF)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            margin="normal"
            autoFocus
            InputProps={{ inputProps: { min: 100, step: 100 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleDeposit}
            variant="contained"
            disabled={depositing || !depositAmount}
          >
            {depositing ? <CircularProgress size={24} /> : 'Recargar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentSearchUser;