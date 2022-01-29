import React,{useContext, useEffect} from 'react'
import { SocketContext } from '../context/SocketContext';
import {useMapBox} from '../hooks/useMapBox';


const puntoInicial = {
    lng:5,
    lat:34,
    zoom:10
}

export const MapaPage = () => {

  const {setRef,coords, nuevoMarcador$,movimientoMarcador$,agregarMarcador,actualizarPosicion} = useMapBox(puntoInicial);
  const {socket} = useContext(SocketContext);

  //Escuchar los maracdores exstentes
  useEffect(() => {
    socket.on('marcadores-activos',(item)=>{
        for(const key of Object.keys(item)){
          agregarMarcador(item[key])
        }
    })
  }, [socket,agregarMarcador]);
//------------------------  
  useEffect(() => {
    nuevoMarcador$.subscribe(item=>{
      socket.emit('marcador-nuevo',item);
    })
    return () => {
    };
  }, [nuevoMarcador$,socket]);

  useEffect(() => {
    socket.on('marcador-nuevo',(item)=>{
      agregarMarcador(item,item.id);
    })
    return () => {
    };
  }, [socket,agregarMarcador]);
//------------------------
  useEffect(() => {
    movimientoMarcador$.subscribe(item =>{
      socket.emit('marcador-actualizado',item);
    })
    return () => {
    };
  }, [movimientoMarcador$,socket]);
  

  useEffect(() => {
    socket.on('marcador-actualizado',(item)=>{
      actualizarPosicion(item);
    })
  }, [socket,actualizarPosicion]);
  



  return (
    <>
      <div className="info">
          Lng:{coords.lng} | lat: {coords.lat} | zoom: {coords.zoom}
      </div>
        <div ref={setRef} className='mapContainer' />
    </>
  )
};
