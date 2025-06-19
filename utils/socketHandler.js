const {handleConnection} = require('../controller/gameController')

const  setupSocket =  (io) =>{
    io.on('connection', (socket) => {
        console.log(`Player ${socket.id} connected`);
        handleConnection(io, socket);
    });
}


module.exports = {setupSocket};