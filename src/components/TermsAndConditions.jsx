// components/TermsAndConditions.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { CheckCircle, Security, Gavel, PrivacyTip, Warning } from '@mui/icons-material';

const TermsAndConditions = ({ open, onClose, onAccept }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Gavel />
        Términos y Condiciones de Uso
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            🎵 Bienvenido a DjiMusic
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Última actualización: {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        {/* Sección 1: Aceptación */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <CheckCircle color="primary" sx={{ mr: 1, fontSize: 20 }} />
            1. Aceptación de Términos
          </Typography>
          <Typography variant="body2" paragraph>
            Al registrarte y utilizar DjiMusic, aceptas cumplir con estos términos y condiciones. 
            Si no estás de acuerdo con alguno de estos términos, no podrás utilizar la plataforma ni sus servicios.
          </Typography>
        </Box>

        {/* Sección 2: Uso del Servicio */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Security color="primary" sx={{ mr: 1, fontSize: 20 }} />
            2. Uso del Servicio
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Edad mínima"
                secondary="Debes ser mayor de 13 años o contar con autorización parental"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Uso personal"
                secondary="El contenido es para tu uso personal y no debe redistribuirse comercialmente"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Prohibiciones"
                secondary="No vulnerar derechos de autor, realizar ingeniería inversa, ni sobrecargar servidores"
              />
            </ListItem>
          </List>
        </Box>

        {/* Sección 3: Contenido y Derechos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Gavel color="primary" sx={{ mr: 1, fontSize: 20 }} />
            3. Contenido y Derechos de Autor
          </Typography>
          <Typography variant="body2" paragraph>
            DjiMusic respeta los derechos de propiedad intelectual. Los usuarios son responsables 
            del contenido que suben y deben contar con los derechos necesarios para compartirlo.
          </Typography>
          <Typography variant="body2" paragraph>
            Al subir contenido, otorgas a DjiMusic una licencia no exclusiva para almacenar, 
            reproducir y distribuir dicho contenido dentro de la plataforma y de acuerdo a su funcionamiento.
          </Typography>
        </Box>

        {/* Sección 4: Privacidad y Datos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <PrivacyTip color="primary" sx={{ mr: 1, fontSize: 20 }} />
            4. Privacidad, Protección de Datos y Confidencialidad
          </Typography>
          <Typography variant="body2" paragraph>
            En DjiMusic nos comprometemos con la protección de tu privacidad y confidencialidad. 
            La información que nos proporcionas será tratada con estricta seguridad y utilizada únicamente para ofrecer y mejorar nuestros servicios.
          </Typography>
          <Typography variant="body2" paragraph>
            Recopilamos información como: datos de registro, preferencias musicales, historial de uso, y datos técnicos necesarios para el funcionamiento de la plataforma. Esta información será usada exclusivamente para fines legítimos relacionados con el servicio.
          </Typography>
          <Typography variant="body2" paragraph>
            Nunca compartiremos tus datos personales con terceros sin tu consentimiento, salvo por obligaciones legales o cuando sea necesario para cumplir con el funcionamiento del servicio. Mantenemos protocolos de seguridad robustos para proteger tu información contra accesos no autorizados, pérdida o divulgación.
          </Typography>
          <Typography variant="body2">
            Para más detalles sobre cómo manejamos tus datos personales, consulta nuestra <strong>Política de Privacidad</strong>.
          </Typography>
        </Box>

        {/* Sección 5: Limitaciones */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ⚠️ 5. Limitaciones de Responsabilidad
          </Typography>
          <Typography variant="body2" paragraph>
            DjiMusic no se hace responsable por:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Interrupciones del servicio por mantenimiento o causas externas" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Contenido subido por usuarios que infrinja derechos de autor" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Uso indebido de la plataforma por parte de usuarios" />
            </ListItem>
          </List>
        </Box>

        {/* Sección 6: Modificaciones */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            🔄 6. Modificaciones de Términos
          </Typography>
          <Typography variant="body2">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
            Las modificaciones serán notificadas y el uso continuado del servicio implica 
            la aceptación de los nuevos términos.
          </Typography>
        </Box>

        {/* Contacto */}
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200',
          mt: 3
        }}>
          <Typography variant="subtitle2" gutterBottom>
            📧 Contacto
          </Typography>
          <Typography variant="body2">
            Para consultas sobre estos términos y nuestra política de privacidad: <strong>machimboleoncio@gmail.com</strong>
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          Cerrar
        </Button>
        <Button 
          onClick={onAccept}
          variant="contained"
          color="primary"
          startIcon={<CheckCircle />}
        >
          Aceptar Términos
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsAndConditions;
