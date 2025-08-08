const socket = io();
let map;
let markers = {};
let userLocation = {};

// Initialize the map
document.addEventListener('DOMContentLoaded', () => {
    map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Get user's location and update in real-time
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                userLocation = { latitude, longitude };

                // Send location to server
                socket.emit('location', userLocation);

                // Update user's marker on map
                if (!markers[socket.id]) {
                    markers[socket.id] = L.marker([latitude, longitude]).addTo(map);
                } else {
                    markers[socket.id].setLatLng([latitude, longitude]);
                }

                map.setView([latitude, longitude], 15); // Center map
            },
            (error) => console.error('Geolocation error:', error),
            { enableHighAccuracy: true }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

// Listen for location updates from other users
socket.on('update-location', (data) => {
    if (!markers[data.id]) {
        markers[data.id] = L.marker([data.latitude, data.longitude]).addTo(map);
    } else {
        markers[data.id].setLatLng([data.latitude, data.longitude]);
    }
});

// Remove marker when a user disconnects
socket.on('remove-marker', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

// Voice Assistant
const activateAssistant = document.getElementById('activate-assistant');
const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert('Speech Recognition is not supported by your browser.');
}

activateAssistant.addEventListener('click', () => {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.start();
    recognition.onresult = async (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log('Command:', command);

        if (command.includes('tell me my current location')) {
            const { latitude, longitude } = userLocation;

            if (latitude && longitude) {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    const address = data.display_name;

                    // Use Text-to-Speech
                    const utterance = new SpeechSynthesisUtterance(
                        `Your current location is ${address}`
                    );
                    speechSynthesis.speak(utterance);
                } catch (error) {
                    console.error('Error fetching location:', error);
                    const utterance = new SpeechSynthesisUtterance(
                        'There was an error fetching your location.'
                    );
                    speechSynthesis.speak(utterance);
                }
            } else {
                const utterance = new SpeechSynthesisUtterance(
                    'Location not available yet.'
                );
                speechSynthesis.speak(utterance);
            }
        } else {
            const utterance = new SpeechSynthesisUtterance(
                'I did not understand the command.'
            );
            speechSynthesis.speak(utterance);
        }
    };
});





// const socket = io();
// let map;
// let markers = {};
// let userLocation = {};

// // ✅ Function to update user's location
// function updateMapLocation(latitude, longitude) {
//     userLocation = { latitude, longitude };

//     if (!markers[socket.id]) {
//         markers[socket.id] = L.marker([latitude, longitude]).addTo(map);
//     } else {
//         markers[socket.id].setLatLng([latitude, longitude]);
//     }

//     map.setView([latitude, longitude], 15);
// }

// // ✅ Initialize Map
// document.addEventListener('DOMContentLoaded', () => {
//     map = L.map('map').setView([20.5937, 78.9629], 5);
    
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//     }).addTo(map);

//     if (navigator.geolocation) {
//         navigator.geolocation.watchPosition(
//             (position) => {
//                 const { latitude, longitude } = position.coords;
//                 updateMapLocation(latitude, longitude);
//                 socket.emit('location', userLocation);
//             },
//             (error) => {
//                 console.error('❌ Geolocation Error:', error.message);
//                 alert('Geolocation failed. Ensure location services are enabled.');
//             },
//             { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
//         );
//     }
// });

// // ✅ Listen for other users' locations
// socket.on('update-location', (data) => {
//     if (!markers[data.id]) {
//         markers[data.id] = L.marker([data.latitude, data.longitude]).addTo(map);
//     } else {
//         markers[data.id].setLatLng([data.latitude, data.longitude]);
//     }
// });

// // ✅ Remove marker when user disconnects
// socket.on('remove-marker', (id) => {
//     if (markers[id]) {
//         map.removeLayer(markers[id]);
//         delete markers[id];
//     }
// });

// // ✅ Draw Route Feature (Fixed)
// document.getElementById("draw-route").addEventListener("click", () => {
//     let destination = prompt("Enter destination (latitude,longitude):").trim();

//     if (!destination) {
//         alert("⚠️ Please enter a valid destination.");
//         return;
//     }

//     // ✅ Extract and validate coordinates
//     let coords = destination.split(",").map(coord => coord.trim());
    
//     if (coords.length !== 2) {
//         alert("❌ Invalid format. Use latitude,longitude (e.g., 28.7041,77.1025)");
//         return;
//     }

//     let destLat = parseFloat(coords[0]);
//     let destLng = parseFloat(coords[1]);

//     if (isNaN(destLat) || isNaN(destLng) || destLat < -90 || destLat > 90 || destLng < -180 || destLng > 180) {
//         alert("❌ Invalid coordinates. Ensure latitude is between -90 to 90 and longitude is between -180 to 180.");
//         return;
//     }

//     // ✅ Add routing layer
//     L.Routing.control({
//         waypoints: [
//             L.latLng(userLocation.latitude, userLocation.longitude),
//             L.latLng(destLat, destLng)
//         ],
//         routeWhileDragging: true
//     }).addTo(map);
// });

// // ✅ Voice Assistant Fix
// const activateAssistant = document.getElementById('activate-assistant');
// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// if (!SpeechRecognition) {
//     alert("⚠️ Your browser does not support voice recognition. Use Chrome or Edge.");
// } else {
//     activateAssistant.addEventListener("click", () => {
//         const recognition = new SpeechRecognition();
//         recognition.lang = "en-US";
//         recognition.interimResults = false;

//         console.log("🎤 Listening...");
//         recognition.start();

//         recognition.onresult = async (event) => {
//             let command = event.results[0][0].transcript.toLowerCase();
//             console.log("✅ Recognized Command:", command);

//             if (command.includes("current location")) {
//                 if (!userLocation.latitude || !userLocation.longitude) {
//                     speak("Location not available yet.");
//                     return;
//                 }

//                 try {
//                     let response = await fetch(
//                         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}`
//                     );
//                     let data = await response.json();
//                     let address = data.display_name;
//                     speak(`Your location is ${address}`);
//                 } catch (error) {
//                     console.error("❌ Error fetching location:", error);
//                     speak("I could not get your location.");
//                 }
//             } else {
//                 speak("I did not understand that command.");
//             }
//         };

//         recognition.onerror = (event) => {
//             console.error("❌ Speech recognition error:", event.error);
//         };
//     });
// }

// // ✅ Function for speech output
// function speak(text) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     speechSynthesis.speak(utterance);
// }





