import ChatMessage from '../Models/Chat.js';
import User from '../Models/User.js';

export const handleChat = (socket, io) => {
    const userRooms = new Map();

    socket.on('join', async ({ userId, role }) => {
        const room = `chat_${userId}`;
        socket.join(room);
        userRooms.set(socket.id, userId);
        
        if (role === 'admin') {
            socket.join('admin_notifications');
            await ChatMessage.updateMany(
                { userId, sender: 'user', read: false },
                { $set: { read: true } }
            );
            io.to(room).emit('messagesRead');
        }
    });

    socket.on("chatMessage", async ({ userId, sender, text, tempId }) => {
        try {
            const newMessage = await ChatMessage.create({ 
                userId, 
                sender, 
                text,
                read: sender === 'admin' ? false : true
            });

            const messageWithUser = await ChatMessage.populate(newMessage, {
                path: 'userId',
                select: 'name email'
            });

            io.to(`chat_${userId}`).emit("chatMessage", {
                ...messageWithUser.toObject(),
                tempId,
                formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            if (sender === 'user') {
                io.to('admin_notifications').emit("newMessageNotification", {
                    userId,
                    message: text,
                    sender,
                    userName: messageWithUser.userId.name || `User ${userId.substring(0, 6)}`
                });
            }
        } catch (error) {
            console.error("Message save error:", error);
        }
    });

    socket.on('disconnect', async () => {
        const userId = userRooms.get(socket.id);
        if (userId) {
            await ChatMessage.updateMany(
                { userId, sender: 'admin', read: false },
                { $set: { read: true } }
            );
            userRooms.delete(socket.id);
        }
    });

    socket.on('leaveChat', async ({ userId }) => {
        socket.leave(`chat_${userId}`);
        if (socket.rooms.has('admin_notifications')) {
            socket.leave('admin_notifications');
        }
    });
};


export const getChatMessages = async (req, res) => {
    try {
        const messages = await ChatMessage.find({ userId: req.query.userId })
            .sort({ createdAt: 1 })
            .populate('userId', 'name email');
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getChatUsers = async (req, res) => {
    try {
        const userIds = await ChatMessage.distinct('userId');
        const users = await User.find(
            { _id: { $in: userIds } },
            'name email lastActive'
        );
        
        const usersWithLastMessage = await Promise.all(users.map(async user => {
            const lastMessage = await ChatMessage.findOne({ userId: user._id })
                .sort({ createdAt: -1 });
            return {
                ...user.toObject(),
                lastMessage: lastMessage?.text,
                lastMessageTime: lastMessage?.createdAt
            };
        }));
        
        res.status(200).json(usersWithLastMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        await ChatMessage.updateMany(
            { userId: req.body.userId, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};