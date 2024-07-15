const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/db');
const routes = require('./routes');
const http = require('http');
const socketIo = require('socket.io');
const Message = require('./models/Message'); 
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path')
const fileUpload = require('express-fileupload')

// Body Parser Middleware
//.app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static(path.resolve(__dirname, 'static')));

// Используем объединенные маршруты
app.use('/api', routes);

// Test route
app.get('/', (req, res) => {
    res.send('Welcome to the social network API!');
});

// Создание HTTP-сервера и инициализация socket.io
const server = http.createServer(app);
const io = socketIo(server);

// Socket.io connection
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', async (data) => {
        const { senderId, receiverId, content } = data;
        try {
            const message = await Message.create({ senderId, receiverId, content });
            io.emit('chat message', message);
        } catch (error) {
            console.error(error);
        }
    });
});

// Sync database and start server
sequelize.sync()
    .then(result => {
        console.log(result);
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.log(err);
    });
