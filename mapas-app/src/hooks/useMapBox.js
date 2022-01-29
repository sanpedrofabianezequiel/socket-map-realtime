import  { useEffect, useRef,useState,useCallback} from 'react';
import mapboxgl from 'mapbox-gl';
import {v4} from 'uuid';
import {Subject} from 'rxjs';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FucGVkcm9mYWJpYW5lemVxdWllbCIsImEiOiJja3l4b2Nra2wwOHNwMm9uejhoYjdtOHNwIn0.fY3UBv6cFq2UTMbQqHihYg';

export const useMapBox=(puntoInicial)=>{
    
    const mapDiv = useRef();
    const marcadores = useRef({})

    //Observables de RXJS
    const $movimientoMarcador=  useRef(new Subject());
    const $nuevoMarcador =  useRef(new Subject());








    const setRef = useCallback((node) => {
      mapDiv.current = node;
    }, []);
    
    //const [mapa, setMap] = useState();
    const mapa = useRef();
    const [coords, setCoords] = useState(puntoInicial);

    //funcion para agregar marcadores;
    const agregarMarcador = useCallback((event,id) => {
        const {lat,lng} = event.lngLat || event;
        
          const marker = new mapboxgl.Marker();
          marker.id = id ?? v4(); //si no existe ID del backend armo mi marcador en el cliente

          marker.setLngLat([lng,lat])
                .addTo(mapa.current)
                .setDraggable(true) 
        
          marcadores.current[marker.id] = marker;//Asignamos el objeto de marcadores

          //Si el marcaodr tiene ID no emitr
          if(!id){
              //Si el marcador tiene ID es por que viene del backend por enden no deberia entrart aca
            $nuevoMarcador.current.next({
                id:marker.id,
                lng,
                lat
            });
          }

          //escuchar el movimiento de cada marcador segund ID
          marker.on('drag',({target})=>{
              const {id} = target;
              const {lng,lat} = target.getLngLat();

              //TODO: emitir los cambios del marcador al soket backend
              $movimientoMarcador.current.next({
                id:id,
                lng,
                lat
            });
          })

    }, []);
    

    //Funcion para actualizar la unicacion dle marcador
    const actualizarPosicion = useCallback(({id,lng,lat}) => {
      marcadores.current[id].setLngLat([lng,lat]);
    }, []);
    

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center:[puntoInicial.lng,puntoInicial.lat],
            zoom:puntoInicial.zoom
          });

        mapa.current = map;

      return () => {
        
      };
    }, [puntoInicial]);
    
    //Cuando se mueve el mapa
    useEffect(() => {
      mapa.current?.on('move',()=>{
        const {lng,lat} =  mapa.current?.getCenter();
        setCoords({
          lng:lng.toFixed(4),
          lat:lat.toFixed(4),
          zoom:mapa.current?.getZoom().toFixed(2)
        })
      })
     
      return () => {
        mapa.current?.off('move');
      };
    }, []);


    //agregar marcadores cuando hago click
    useEffect(() => {
      mapa.current?.on('click',(event)=>{
        agregarMarcador(event);
      })
    
      return () => {
        
      };
    }, [agregarMarcador]);
    

    return {
        coords,
        setRef,
        marcadores,
        nuevoMarcador$:$nuevoMarcador.current,
        movimientoMarcador$:$movimientoMarcador.current,
        agregarMarcador,
        actualizarPosicion
    }
}