import React, { useState, useEffect } from "react";
import { Button, Card, CardContent, Typography, Box } from "@mui/material";
import { styled } from "@mui/system";

const ClockContainer = styled(Card)({
  backgroundColor: "#1E1E1E",
  color: "thistle",
  textAlign: "center",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  padding: "20px",
  maxWidth: "300px",
  margin: "auto",
});

const TimeDisplay = styled(Typography)({
  fontSize: "3rem",
  fontWeight: "bold",
  fontFamily: "'Courier New', Courier, monospace",
  marginBottom: "10px",
});

const ButtonContainer = styled(Box)({
  display: "flex",
  justifyContent: "space-around",
  marginTop: "10px",
});

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  const [is24HourFormat, setIs24HourFormat] = useState(true);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime(new Date());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const toggleFormat = () => {
    setIs24HourFormat((prev) => !prev);
  };

  const toggleClock = () => {
    setIsRunning((prev) => !prev);
  };

  const formattedTime = is24HourFormat
    ? time.toLocaleTimeString("en-GB") // 24-hour format
    : time.toLocaleTimeString("en-US"); // 12-hour format

  return (
    <ClockContainer>
      <CardContent>
        <TimeDisplay>{formattedTime}</TimeDisplay>
        <Typography variant="body2" color="textSecondary">
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
        <ButtonContainer>
          <Button
            variant="contained"
            color="primary"
            onClick={toggleFormat}
          >
            Cambiar a {is24HourFormat ? "12 horas" : "24 horas"}
          </Button>
          <Button
            variant="contained"
            color={isRunning ? "secondary" : "success"}
            onClick={toggleClock}
          >
            {isRunning ? "Pausar" : "Reanudar"}
          </Button>
        </ButtonContainer>
      </CardContent>
    </ClockContainer>
  );
};

export default DigitalClock;
