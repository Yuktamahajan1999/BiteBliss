import Feedback from '../Models/FeedbackPage.js';

// Create new feedback
export const createFeedback = async (req, res) => {
    try {
        const { feedbackText, name } = req.body;

        if (!feedbackText) {
            return res.status(400).json({ message: 'Feedback text is required' });
        }

        if (!req.user || !req.user.name) {
            return res.status(401).json({ message: 'Unauthorized: User must be logged in' });
        }

        const newFeedback = new Feedback({
            feedbackText,
            name: name || req.user.name,
            userId: req.user.id,
        });

        await newFeedback.save();

        res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all feedback entries
export const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update feedback
export const updateFeedback = async (req, res) => {
    try {
        const { id } = req.query;
        const { feedbackText, name } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Feedback ID is required' });
        }

        if (!feedbackText && !name) {
            return res.status(400).json({ message: 'At least one of feedback text or name is required for update' });
        }

        
        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

    
        if (feedback.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You can only update your own feedback' });
        }

       
        const updateData = {};
        if (feedbackText) updateData.feedbackText = feedbackText;
        if (name) updateData.name = name;

      
        const updatedFeedback = await Feedback.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ message: 'Feedback updated successfully', feedback: updatedFeedback });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete feedback 
export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: 'Feedback ID is required' });
        }

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

    
        if (feedback.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own feedback' });
        }

    
        await Feedback.findByIdAndDelete(id);

        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Get feedback 
export const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: 'Feedback ID is required' });
        }

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
