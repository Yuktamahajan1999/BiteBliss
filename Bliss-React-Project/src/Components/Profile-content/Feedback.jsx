/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';

const Feedback = () => {
    const [feedback, setFeedback] = useState('');
    const [message, setMessage] = useState('');
    const [allFeedbacks, setAllFeedbacks] = useState([]);

    const token = localStorage.getItem('token');

    const getAllFeedbackData = async () => {
        try {
            const res = await axios.get('http://localhost:8000/feedbackpage/getallFeedback', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAllFeedbacks(res.data);
        } catch (error) {
            console.error("Error getting feedbacks:", error);
        }
    };

    const submitUserFeedback = async () => {
        if (!feedback) {
            alert("Please enter your feedback before submitting.");
            return;
        }

        try {
            const res = await axios.post('http://localhost:8000/feedbackpage', {
                feedbackText: feedback
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("🌟 Thanks! Your feedback helps shape our service.");
            setFeedback('');
            getAllFeedbackData(); // Refresh list
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    };

    const removeMyFeedback = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/feedbackpage/deleteFeed?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            getAllFeedbackData(); // Refresh list
        } catch (error) {
            console.error("Error deleting feedback:", error);
        }
    };

    useEffect(() => {
        getAllFeedbackData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMessage('');
        }, 5000);
        return () => clearTimeout(timer);
    }, [message]);

    return (
        <Box className='feedback-container' sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
            <Box className='feedback-header' textAlign="center" mb={3}>
                <img
                    src="Icons/feedback.gif"
                    alt="Feedback illustration"
                    className='feedback-gif'
                    style={{ width: 120, height: 120 }}
                />
                <Typography variant="h4" gutterBottom>
                    Send Feedback
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Tell us what you love about the app, or what we could be doing better.
                </Typography>
            </Box>

            <Box className='feedback-form' component="form">
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    variant="outlined"
                    placeholder="Type your feedback here..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Box className='feedback-support' display="flex" alignItems="center" p={2} mb={3} bgcolor="grey.100" borderRadius={1}>
                    <img
                        src="Icons/help.png"
                        alt="Help icon"
                        className='Feedback-icon'
                    />
                    <Box>
                        <Typography variant="subtitle1" component="h3" gutterBottom>
                            Need help with your order?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Get instant help from our customer support team
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<img src="Icons/star.png" alt="Star icon" className='star-icon' />}
                    onClick={submitUserFeedback}
                    disabled={!feedback}
                    className='feedback-btn'
                >
                    Submit Feedback
                </Button>

                {message && <Typography variant="body1" color="success.main" mt={2}>{message}</Typography>}
            </Box>

            <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                    User Reviews & Feedback
                </Typography>
                {allFeedbacks.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No feedback yet.</Typography>
                ) : (
                    allFeedbacks.map((fb) => (
                        <Box key={fb._id} p={2} mb={2} bgcolor="#f9f9f9" borderRadius={2} boxShadow={1}>
                            <Typography variant="subtitle2">{fb.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{fb.feedbackText}</Typography>
                            <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => removeMyFeedback(fb._id)}
                                sx={{ mt: 1 }}
                            >
                                Delete
                            </Button>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default Feedback;
