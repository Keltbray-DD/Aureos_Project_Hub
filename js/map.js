document.addEventListener("DOMContentLoaded", async function () {


  
})

async function getPostcodes(data) {
    const postcodes = data
    .map(item => item.Postcode) // Extract 'Postcode' values
    .filter(postcode => postcode !== undefined); // Remove undefined values

    console.log("postcodes",postcodes);
    return postcodes
}

async function getCoordinates(data) {
  console.log(data)
  let coordinates = data.data
    .map(item => {
      if (item.lat !== undefined && item.lon !== undefined) {
        return { lat: item.lat || undefined, lon: item.lon || undefined, project: item.projectName || undefined};
      }
      return undefined;
    })
    coordinates = coordinates.filter(item => item.lat !== undefined); // Remove undefined values

  console.log("coordinates", coordinates);
  return coordinates;
}


async function generateMap(postcodes) {
    // Create a map centered on a default location
  const map = L.map('map').setView([54.5, -3], 5);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  await addMarkers()

  async function geocodePostcode(postcode) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        postcode
      )}&format=json`
    );
    const data = await response.json();

    if (data.length > 0) {
        console.log(data[0])
      const { lat, lon } = data[0];

      return { lat, lon };
    } else {
      console.error(`No coordinates found for postcode: ${postcode}`);
      return null;
    }
  }

  async function addMarkers() {

    // for (let index = 0; index < postcodes.length; index++) {
    //   const element = postcodes[index];
    //   const coords = await geocodePostcode(element);
    //   if (coords) {
    //     L.marker([coords.lat, coords.lon])
    //       .addTo(map)
    //       .bindPopup(`Postcode: ${element}`)
    //       .openPopup();
    //   }
    // }
    postcodes.forEach(async element => {
      //const coords = await geocodePostcode(element);

        L.marker([element.lat, element.lon])
          .addTo(map)
          .bindPopup(`${element.project}`)
          //.openPopup();
      
    });
 
  }
}
