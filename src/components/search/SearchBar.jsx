// src/components/search/SearchBar.jsx - VERSIÓN CORREGIDA
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear,
} from '@mui/icons-material';

const SearchBar = ({ 
  query = "", 
  onQueryChange, 
  loading = false,
  autoFocus = false,
  placeholder = "Que cancion tienes en mente?..."
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  
  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  const handleClear = () => {
    onQueryChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onQueryChange("");
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
    
    if (e.key === 'Enter' && query.trim().length >= 2) {
      // El hook manejará la búsqueda automáticamente
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };
  
  return (
    <Box 
      sx={{ 
        position: 'relative',
        width: '100%',
      }}
    >
      <TextField
        fullWidth
        inputRef={inputRef}
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        variant="outlined"
        InputProps={{
          startAdornment: (
            <SearchIcon 
              sx={{ 
                mr: 1, 
                color: focused ? '#00838F' : '#006064',
              }} 
            />
          ),
          endAdornment: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
              {query && !loading && (
                <IconButton 
                  onClick={handleClear} 
                  size="small"
                  sx={{ color: '#00838F' }}
                >
                  <Clear />
                </IconButton>
              )}
            </Box>
          ),
          sx: {
            borderRadius: 2,
            bgcolor: 'white',
            '&:hover': {
              bgcolor: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00838F',
              }
            },
            '&.Mui-focused': {
              bgcolor: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00838F',
                borderWidth: '2px',
              }
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: focused ? '#00838F' : '#B2EBF2',
            }
          }
        }}
        sx={{
          '& .MuiInputBase-input': {
            color: '#006064',
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            fontSize: '1rem',
            padding: '12px 14px',
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#90A4AE',
            opacity: 1,
          }
        }}
      />
    </Box>
  );
};

export default SearchBar;