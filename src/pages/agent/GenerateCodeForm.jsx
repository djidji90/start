// src/pages/agent/GenerateCodeForm.jsx
// ✅ Con mejor manejo de errores para ver el problema real

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import { ContentCopy, QrCode, CheckCircle } from '@mui/icons-material';
import { getAuthToken } from '../../components/hook/services/apia';

const GenerateCodeForm = ({ onSuccess }) => {
  const theme = useTheme();
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currency, setCurrency] = useState('XAF');
  const [expiresDays, setExpiresDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedCodes([]);

    try {
      const token = getAuthToken();
      
      const payload = {
        amount: parseFloat(amount),
        quantity: parseInt(quantity),
        currency: currency,
        expires_days: parseInt(expiresDays)
      };
      
      console.log('📤 Enviando payload:', payload); // 👈 DEBUG
      
      const response = await fetch('https://api.djidjimusic.com/wallet/agent/generate-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // 👈 LEER EL ERROR COMPLETO DEL BACKEND
      const responseText = await response.text();
      console.log('📥 Respuesta raw:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { error: responseText || 'Error desconocido' };
      }

      if (!response.ok) {
        // Mostrar el error detallado del backend
        throw new Error(data.error || data.message || `Error ${response.status}: ${responseText.substring(0, 200)}`);
      }

      setGeneratedCodes(data.codes || []);
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error('Error generating codes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const montosSugeridos = [500, 1000, 2000, 5000, 10000];

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Monto del código (XAF)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {montosSugeridos.map((m) => (
                <Button
                  key={m}
                  size="small"
                  variant={parseFloat(amount) === m ? 'contained' : 'outlined'}
                  onClick={() => setAmount(m.toString())}
                  sx={{ borderRadius: 2 }}
                >
                  {m}
                </Button>
              ))}
            </Box>
            <TextField
              fullWidth
              type="number"
              label="Monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              InputProps={{ inputProps: { min: 100, step: 100 } }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Cantidad de códigos"
              value={quantity}
              onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, 50))}
              inputProps={{ min: 1, max: 50 }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              select
              label="Moneda"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="XAF">XAF - Franco CFA</option>
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - Dólar</option>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Días de expiración"
              value={expiresDays}
              onChange={(e) => setExpiresDays(Math.min(parseInt(e.target.value) || 30, 365))}
              inputProps={{ min: 1, max: 365 }}
              helperText="Los códigos expiran después de este tiempo"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || !amount}
              sx={{ py: 1.5, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : `Generar ${quantity} código${quantity > 1 ? 's' : ''}`}
            </Button>
          </Grid>
        </Grid>
      </form>

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {generatedCodes.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ✅ Códigos generados
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {generatedCodes.map((code, index) => (
              <Card key={index} sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="body1" fontWeight={700} fontFamily="monospace">
                      {code.code}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Intl.NumberFormat().format(code.amount)} {code.currency} • Expira: {new Date(code.expires_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title={copiedCode === code.code ? '¡Copiado!' : 'Copiar código'}>
                      <IconButton size="small" onClick={() => handleCopyCode(code.code)}>
                        {copiedCode === code.code ? <CheckCircle color="success" /> : <ContentCopy />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver QR">
                      <IconButton size="small" href={code.qr_url} target="_blank">
                        <QrCode />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GenerateCodeForm;