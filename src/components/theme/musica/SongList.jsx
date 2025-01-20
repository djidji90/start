import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Grid, Card, CardContent, Typography } from '@mui/material';

const SongList = () => {
    const [songs, setSongs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch songs based on the current page and search term
    const handleSearch = async (page = 1) => {
        try {
            const response = await axios.get('/api2/songs/', {
                params: {
                    search: searchTerm,
                    page: page,
                },
            });

            setSongs(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 3)); // Assuming 3 items per page
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };

    // Update the search term and reset pagination
    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setCurrentPage(1); // Reset to the first page when searching
        handleSearch(1);
    };

    // Handle page navigation
    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) => {
            const newPage = direction === 'next' ? prevPage + 1 : prevPage - 1;
            handleSearch(newPage);
            return newPage;
        });
    };

    useEffect(() => {
        handleSearch(currentPage);
    }, [currentPage]);

    return (
        <div>
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                <TextField
                    label="Search Songs"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleInputChange}
                    fullWidth
                />
                <Button type="submit" variant="contained" color="primary" style={{ marginTop: '10px' }}>
                    Search
                </Button>
            </form>

            <Grid container spacing={2}>
                {songs.map((song) => (
                    <Grid item xs={12} sm={6} md={4} key={song.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{song.title}</Typography>
                                <Typography variant="body2">Artist: {song.artist}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Typography>Page {currentPage} of {totalPages}</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default SongList;
