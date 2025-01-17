import React from 'react';
import { CircularProgress, Modal, Box } from '@mui/material';

const LoadingModal = ({ isLoading }) => {
    return (
        <Modal open={isLoading} aria-labelledby="loading-modal" aria-describedby="loading-modal-description">
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        </Modal>
    );
};

export default LoadingModal;
