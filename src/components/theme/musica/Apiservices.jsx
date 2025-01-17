// apiService.js

import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api2";

export const fetchSongDetails = async (songId) => {
  const response = await axios.get(`${BASE_URL}/songs/${songId}/`);
  return response.data;
};

export const toggleLikeSong = async (songId) => {
  const response = await axios.post(`${BASE_URL}/songs/${songId}/like/`);
  return response.data;
};

export const fetchComments = async (songId) => {
  const response = await axios.get(`${BASE_URL}/songs/${songId}/comments/all/`);
  return response.data;
};

export const addComment = async (songId, text) => {
  const response = await axios.post(`${BASE_URL}/songs/${songId}/comments/`, {
    text,
  });
  return response.data;
};
