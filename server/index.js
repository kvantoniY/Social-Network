const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/db');
const routes = require('./routes');
const http = require('http');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path');
const fileUpload = require('express-fileupload');
const socketHandler = require('./socket');

// Body Parser Middleware
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

// Инициализация socket.io
socketHandler(server);

// Sync database and start server
sequelize.sync()
  .then(result => {
    console.log(result);
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.log(err);
  });
