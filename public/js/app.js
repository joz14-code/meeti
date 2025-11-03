import { OpenStreetMapProvider } from "leaflet-geosearch";

const lat = 4.81428
const lng = -75.69488
const map = L.map('mapa').setView([lat, lng], 15); //15 --> zoom
let markers = new L.FeatureGroup().addTo(map);
let marker;

//utilizar provider y GeoCoder
const geocodeService = L.esri.Geocoding.geocodeService();

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map); 
    
    const buscador = document.querySelector('#formbuscador');
    buscador.addEventListener('input', buscarDireccion);
})

function buscarDireccion(e) {
    if(e.target.value.length > 8){

        //si existe un marker anterior, eliminarlo
        markers.clearLayers();

        const provider = new OpenStreetMapProvider();
        provider.search({ query: e.target.value }).then(( resultado ) => {

            geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function(error, result) {

                console.log(result);
                
                //mostrar el mapa
                map.setView(resultado[0].bounds[0], 15);
                
                //agregar pin
                marker = new L.marker(resultado[0].bounds[0], {
                    draggable: true,
                    autoPan: true
                
                })
                .addTo(map)
                .bindPopup(resultado[0].label)     
                .openPopup();       

                //asignar al contenedor
                markers.addLayer(marker);

                //Detectar movimiento del marker
                marker.on('moveend', function(e){
                    marker = e.target;
                    const posicion = marker.getLatLng();
                    map.panTo(new L.LatLng(posicion.lat, posicion.lng)); //panTo --> centra el mapa en la nueva posicion 
                    
                    //reverse geocoding, cuando el usuario reubica el marker
                    geocodeService.reverse().latlng(posicion, 15).run(function(error, result) {

                        console.log(result);
                    })
               
                });

            });

        });
    }
}    