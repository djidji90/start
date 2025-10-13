import React from "react";
import PropTypes from "prop-types";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const PasswordInput = React.memo(({
  name,
  label,
  value,
  onChange,
  show,
  toggleShow,
  error,
  helperText
}) => (
  <TextField
    fullWidth
    label={label}
    name={name}
    type={show ? "text" : "password"}
    value={value}
    onChange={onChange}
    error={!!error}
    helperText={typeof helperText === "string" ? helperText : ""}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton 
            onClick={toggleShow} 
            edge="end"
            aria-label="toggle-password"
          >
            {show ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
));

PasswordInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,  // o usa ReactNode si lo deseas
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  toggleShow: PropTypes.func.isRequired,
  error: PropTypes.string,
  helperText: PropTypes.string,
};

export default PasswordInput;
