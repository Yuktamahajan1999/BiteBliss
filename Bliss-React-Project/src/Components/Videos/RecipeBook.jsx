/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useState, useEffect } from 'react';

const RecipeBook = () => {
    const [recipes, setRecipes] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        prepTime: '',
        ingredients: '',
        instructions: '',
        media: []
    });
    const [mediaFiles, setMediaFiles] = useState([]);
    const [linkInput, setLinkInput] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    const getAllRecipes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:8000/recipebook');
            console.log('Fetched recipes:', response.data.recipes);
            setRecipes(response.data.recipes || []);
        } catch (error) {
            setError('Failed to fetch recipes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getAllRecipes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setMediaFiles(prev => [...prev, ...files]);
        const previews = files.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image',
            name: file.name,
            isFile: true
        }));
        setFormData(prev => ({
            ...prev,
            media: [...prev.media, ...previews]
        }));
    };

    const handleLinkAdd = () => {
        if (!linkInput.trim()) return;

        const url = linkInput.trim();
        const isVideo = url.match(/\.(mp4|webm|ogg)$/i) ||
            url.includes('youtube.com') ||
            url.includes('youtu.be');
        const isImage = url.match(/\.(jpeg|jpg|png|gif|bmp|svg)$/i);

        if (!isImage && !isVideo) {
            setError("Please enter a valid image or video URL.");
            return;
        }

        const newMedia = {
            url,
            type: isVideo ? 'video' : 'image',
            name: 'link-media',
            isFile: false
        };

        setFormData(prev => ({
            ...prev,
            media: [...prev.media, newMedia]
        }));
        setLinkInput('');
    };

    const removeMedia = (index) => {
        const mediaItem = formData.media[index];
        setFormData(prev => ({
            ...prev,
            media: prev.media.filter((_, i) => i !== index)
        }));
        if (mediaItem.isFile) {
            setMediaFiles(prevMediaFiles => {
                const fileIndex = prevMediaFiles.findIndex(f => f.name === mediaItem.name);
                if (fileIndex !== -1) {
                    return prevMediaFiles.filter((_, i) => i !== fileIndex);
                }
                return prevMediaFiles;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const ingredientsArray = formData.ingredients.split('\n').filter(Boolean);
        const stepsArray = formData.instructions.split('\n').filter(Boolean);

        const submitData = new FormData();
        submitData.append("title", formData.title);
        submitData.append("description", formData.description);
        submitData.append("prepTime", formData.prepTime);
        submitData.append("ingredients", JSON.stringify(ingredientsArray));
        submitData.append("steps", JSON.stringify(stepsArray));

        const existingMedia = formData.media.filter(m => !m.isFile).map(m => m.url);
        submitData.append("mediaLinks", JSON.stringify(existingMedia));

        mediaFiles.forEach(file => {
            submitData.append("media", file);
        });

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        try {
            if (editingId) {
                await axios.put(`http://localhost:8000/recipebook/updaterecipe?id=${editingId}`, submitData, config);
            } else {
                await axios.post('http://localhost:8000/recipebook/addrecipe', submitData, config);
            }
            resetForm();
            await getAllRecipes();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to save recipe');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (recipe) => {
        setFormData({
            title: recipe.title,
            description: recipe.description,
            prepTime: recipe.prepTime || '',
            ingredients: recipe.ingredients.join('\n'),
            instructions: recipe.steps.join('\n'),
            media: recipe.media ? recipe.media.map(item => ({
                url: item.url,
                type: item.type,
                name: item.name || 'media',
                isFile: item.isFile === undefined ? false : item.isFile
            })) : []
        });
        setMediaFiles([]);
        setEditingId(recipe._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this recipe?')) return;

        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`http://localhost:8000/recipebook/deleterecipe?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await getAllRecipes();
        } catch (error) {
            setError('Failed to delete recipe');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            prepTime: '',
            ingredients: '',
            instructions: '',
            media: []
        });
        setMediaFiles([]);
        setLinkInput('');
        setEditingId(null);
        setError(null);
    };

    const renderMediaPreview = (item, index) => {
        if (item.type === 'video') {
            if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
                const videoId = item.url.includes('youtube.com')
                    ? item.url.split('v=')[1].split('&')[0]
                    : item.url.split('youtu.be/')[1].split('?')[0];
                return (
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="media-preview"
                        title={`YouTube video ${index}`}
                    />
                );
            }
            return (
                <video controls className="media-preview">
                    <source src={item.url} />
                </video>
            );
        }
        return <img src={item.url} alt={`Preview ${index}`} className="media-preview" />;
    };

    return (
        <div className="recipe-book">
            <h1 className="recipe-header">Recipe Book</h1>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="recipe-form">
                <input name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} required />
                <input name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} required />
                <input name="prepTime" placeholder="Prep Time" value={formData.prepTime} onChange={handleInputChange} />
                <textarea name="ingredients" placeholder="Ingredients" value={formData.ingredients} onChange={handleInputChange} rows="4" />
                <textarea name="instructions" placeholder="Instructions" value={formData.instructions} onChange={handleInputChange} rows="6" />

                <div className="media-upload-section">
                    <div className="media-preview-container">
                        {formData.media.map((item, index) => (
                            <div key={index} className="media-preview-item">
                                {renderMediaPreview(item, index)}
                                <button type="button" onClick={() => removeMedia(index)} className="remove-media-btn">×</button>
                            </div>
                        ))}
                    </div>

                    <div className="media-input-group">
                        <label className="upload-label">
                            Upload Media
                            <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="recipe-file-input" />
                        </label>

                        <div className="link-input-group">
                            <input
                                type="text"
                                placeholder="Paste link to image or video"
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                className="link-input"
                            />
                            <button type="button" onClick={handleLinkAdd} className="add-link-btn">Add Link</button>
                        </div>
                    </div>
                </div>

                <div className="form-buttons">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Processing...' : editingId ? 'Update Recipe' : 'Add Recipe'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={resetForm} className="cancel-btn" disabled={isLoading}>Cancel</button>
                    )}
                </div>
            </form>

            {isLoading && recipes.length === 0 ? (
                <div className="loading-spinner">Loading recipes...</div>
            ) : recipes.length === 0 ? (
                <div className="no-recipes">No recipes found. Add one to get started!</div>
            ) : (
                <div className="recipes-container">
                    {recipes.map(recipe => (
                        <div key={recipe._id} className="recipe-card">
                            <div className="recipe-header">
                                <h3 className="recipe-title">{recipe.title}</h3>
                                <p className="recipe-description">{recipe.description}</p>
                                {recipe.prepTime && <p className="prep-time">⏱️ {recipe.prepTime}</p>}
                            </div>

                            {recipe.media?.length > 0 && (
                                <div className={`recipe-media-gallery ${recipe.media.length === 1 ? 'single-media' : ''}`}>
                                    {recipe.media.map((media, index) => {
                                        if (media.type === 'video' && (media.url.includes('youtube.com') || media.url.includes('youtu.be'))) {
                                            const videoId = media.url.includes('youtube.com')
                                                ? media.url.split('v=')[1].split('&')[0]
                                                : media.url.split('youtu.be/')[1].split('?')[0];
                                            return (
                                                <div key={index} className="recipe-media-item">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${videoId}`}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        title={`YouTube video ${index}`}
                                                    />
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={index} className="recipe-media-item">
                                                {media.type === 'video' ? (
                                                    <video controls><source src={media.url} /></video>
                                                ) : (
                                                    <img src={media.url} alt={`Media ${index}`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="recipe-section">
                                <h4>🍴 Ingredients</h4>
                                <ul>
                                    {recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>

                            <div className="recipe-section">
                                <h4>📝 Instructions</h4>
                                <ol>
                                    {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
                                </ol>
                            </div>

                            <div className="recipe-actions">
                                <button onClick={() => handleEdit(recipe)} className="edit-btn">✏️ Edit</button>
                                <button onClick={() => handleDelete(recipe._id)} className="delete-btn">🗑️ Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecipeBook;