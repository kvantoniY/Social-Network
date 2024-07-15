const Message = require('../models/Message');
const User = require('../models/User');

exports.getMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const otherUserId = req.params.userId;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'username'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
