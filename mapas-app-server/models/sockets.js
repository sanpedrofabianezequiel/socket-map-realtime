const Marcadores = require("./marcadores");


class Sockets {

    constructor( io ) {

        this.io = io;

        this.marcadores = new Marcadores();
        
        this.socketEvents();
    }

    socketEvents() {
        // On connection
        this.io.on('connection', ( socket ) => {
            socket.emit('marcadores-activos',this.marcadores.activos);//Envio todos los marcadores al cliente

            socket.on('marcador-nuevo',(marcador) =>{
                this.marcadores.agregarMarcador(marcador);

                //Envio a todos menos al que emitio el socket
                socket.broadcast.emit('marcador-nuevo',marcador);
            });

            socket.on('marcador-actualizado',(item)=>{
                this.marcadores.actualizarMarcador(item);
                socket.broadcast.emit('marcador-actualizado',item);
            })
        });
    }


}


module.exports = Sockets;