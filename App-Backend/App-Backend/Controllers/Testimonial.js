import Testimonial from '../Models/Testimonial.js';

// Create a new testimonial
export const createTestimonial = async (req, res) => {
    try {
        const { story, location } = req.body;

        if (!story || !location) {
            return res.status(400).json({ error: "Story and location are required" });
        }

        const author = req.user.name;

        const newTestimonial = new Testimonial({
            story,
            location,
            author,
            userId: req.user.id
        });

        await newTestimonial.save();

        res.status(201).json({ success: true, data: newTestimonial });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// Get all testimonials
export const getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        res.status(200).json({ success: true, data: testimonials });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get testimonial by ID
export const getTestimonialById = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Testimonial ID required" });

    try {
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) return res.status(404).json({ error: "Testimonial not found" });

        res.status(200).json({ success: true, data: testimonial });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update testimonial
export const updateTestimonial = async (req, res) => {
    const { id } = req.query;
    const { story, location } = req.body;

    if (!id) return res.status(400).json({ error: "Testimonial ID required" });

    try {
        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            return res.status(404).json({ error: "Testimonial not found" });
        }

        if (testimonial.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: "You can only update your own testimonials" });
        }

        testimonial.story = story || testimonial.story;
        testimonial.location = location || testimonial.location;

        await testimonial.save();

        res.status(200).json({ success: true, message: "Testimonial updated", data: testimonial });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete testimonial
export const deleteTestimonial = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Testimonial ID required" });

    try {
        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            return res.status(404).json({ error: "Testimonial not found" });
        }

        if (testimonial.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: "You can only delete your own testimonials" });
        }

        await testimonial.deleteOne();

        res.status(200).json({ success: true, message: "Testimonial deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

