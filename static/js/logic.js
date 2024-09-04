function depthColour(depth) {
  if(depth >= 90) return '#621a99';
  else if(depth >= 70) return '#8924d6';
  else if(depth >= 50) return '#a351e1';
  else if(depth >= 30) return '#b573e7';
  else if(depth >= 10) return '#c896ed';
  else return '#e1c6f5';
}

function createMap(earthquakes) {

    // Create the tile layer that will be the background of our map.
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
      
    // Create the map object with options.
    let map = L.map("map", {
      center: [-10.8, 110.9],
      zoom: 3,
      layers: [streetmap, earthquakes] //adds both layers by default
    });


    //create layer control
    L.control.layers({
        "Street Map": streetmap
    }, {
        "Earthquake Locations": earthquakes
    }).addTo(map);

    //Create legend
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
        depths = [0, 10, 30, 50, 70, 90],
        labels = [];
    
    //loop through each depth
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
        '<div class="legend-item"><i style ="background:' + depthColour(depths[i] +1) + '"></i>' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i+1] + '<br>' :
        '+') + '</div>';
    }
    return div;
};

legend.addTo(map);
}




function createMarkers(response) {
  
    // Pull the "features" property from the json.
    let features = response.features;
  
    // Initialise an array to hold the earthquake markers.
    let earthquakeMarkers = [];
  
    // Loop through the features array.
    for (let index = 0; index < features.length; index++) {
      let feature = features[index];
  
      // Convert time to readable format
      let date = new Date(feature.properties.time);
      let formattedDate = date.toLocaleString();
      // For each feature, create a marker, and bind a popup with the place of the earthquake.
      let earthquakeMarker = L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        fillOpacity: 0.75,
        color: depthColour(feature.geometry.coordinates[2]),
        fillColor: depthColour(feature.geometry.coordinates[2]),
        radius: feature.properties.mag*75000
      })
        .bindPopup("<h3>Place:" + feature.properties.place + "<h3><h3>Magnitude: " + feature.properties.mag + 
          "<h3><h3>Depth: " + feature.geometry.coordinates[2]   + "<h3><h3>Time: " + formattedDate + "</h3>");
  
      // Add the marker to the earthquakeMarkers array.
      earthquakeMarkers.push(earthquakeMarker);
    }
  
    // Create a layer group that's made from the earthquake markers array, and pass it to the createMap function.
    createMap(L.layerGroup(earthquakeMarkers));
}
  
  
  // Perform an API call to the USGS earthquakes API to get the information. Call createMarkers when it completes.
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);
  