// Paths to JSON files
const PRODUCT_TO_GABARI_PATH = "static/json/product_to_gabari.json";
const RENDERS_FOLDER = "static/Renders/";
const RENDERS_MAPPING_PATH = "static/json/renders_mapping.json";

const renderContainer = document.getElementById("render-container");
const renderImage = document.getElementById("render-image");

let showGabarisMap = {}; // Tracks visibility for each zone or point

const zonePositions = {
    "ZoneA": { top: "70%", left: "12%" },
    "ZoneB": { top: "62%", left: "12%" },
    "ZoneC": { top: "54%", left: "12%" },
    "ZoneD": { top: "43%", left: "12%" },
    "ZoneE": { top: "68%", left: "27%" },
    "ZoneF": { top: "60%", left: "27%" },
    "ZoneG": { top: "52%", left: "27%" },
    "ZoneH": { top: "41%", left: "27%" },
    "ZoneI": { top: "63%", left: "40%" },
    "ZoneJ": { top: "52%", left: "40%" },
    "ZoneK": { top: "41%", left: "40%" },
    "ZoneL": { top: "47%", left: "50%" },
    "ZoneM": { top: "40%", left: "50%" },
    "ZoneN": { top: "61%", left: "60%" },
    "ZoneO": { top: "50%", left: "60%" },
    "ZoneP": { top: "39%", left: "60%" },
    "ZoneQ": { top: "61%", left: "74%" },
    "ZoneR": { top: "50%", left: "74%" },
    "ZoneS": { top: "39%", left: "74%" },
    "ZoneT": { top: "62%", left: "85%" },
    "ZoneU": { top: "51%", left: "85%" },
    "ZoneV": { top: "40%", left: "85%" }
};

let productToGabari = {};
let rendersMapping = {};

// Fetch JSON files on load
// We use assynchronous programming here for our program to only start when
// the data is loaded, hence the await keyword
async function loadData() {
  const productResponse = await fetch(PRODUCT_TO_GABARI_PATH);
  productToGabari = await productResponse.json();

  const rendersResponse = await fetch(RENDERS_MAPPING_PATH);
  rendersMapping = await rendersResponse.json();
}

// Function to display the render image and then draw gabari points
function findProduct(productCode) {

    // Logic to display the correct render image (replace this with your actual logic)
    // renderImage.src = `static/renders/${productCode}.png`;
    for (let element in rendersMapping) {
        if (element === productCode) {
            const render = rendersMapping[element];
            renderImage.src = `${RENDERS_FOLDER}${render}`;
        }
    }
    console.log("Product code: ", productCode);
    detectZones(productCode);
}

function detectZones(productCode) {
    console.log("Product code: ", productCode);
    zone_list = [];
    for (let element in productToGabari) {
        if (element === productCode) {
            for (let gabari of productToGabari[element]) {
                let zone = gabari["zone"];
                if (!(zone_list.includes(zone))) {
                    zone_list.push(zone);
                }
            }
        }
    }

    // Clear previous points in order to not overlap
    const existingPoints = document.querySelectorAll(".gabari-point");
    existingPoints.forEach(point => point.remove());

    const existingWrapper = document.querySelectorAll(".gabari-wrapper");
    existingWrapper.forEach(wrapper => wrapper.remove());

    for (let zone of zone_list) {
        drawPoint(zonePositions[zone], zone);
    }

    toggleView(productCode);
}

function detectGabaris(productCode, zone) {
    gabariCodes = [];
    gabariImages = [];
    console.log("Product Code: ", productCode);
    for (let element in productToGabari) {
        if (element === productCode) {
            for (let gabari of productToGabari[element]) {
                console.log("Gabari zone: ", gabari["zone"], "\nZone: ", zone);
                if (gabari["zone"] === zone) { // We only get the gabaris corresponding to that zone
                    gabariCodes.push(gabari["gabari_code"]);
                    gabariImages.push(gabari["image"]);
                }
            }
        }
    }
    console.log("Gabari codes: ", gabariCodes, "\nGabari Images: ", gabariImages);
    return { gabariCodes, gabariImages };
}

function drawPoint(pointPositions, zone) { // See zone positions object upstairs

    const point = document.createElement("div");
    point.className = "gabari-point";
    console.log("Point zone attribute: ", zone);
    point.setAttribute("data-zone", zone);
    point.style.position = "absolute";
    point.style.top = pointPositions.top;
    point.style.left = pointPositions.left;
    point.style.width = "20px";
    point.style.height = "20px";
    point.style.backgroundColor = "yellow";
    point.style.borderRadius = "50%";
    
    renderContainer.appendChild(point);
}

// Each function should do one thing well
// If we try doing everything in one function we'll end up being confused
// We have some repetition in the diff functions we can prob work on that
function drawGabaris(zonePosition, gabariCodes, gabariImages, zone) {

    // Get the dimensions of the renderImage
    const renderWidth = renderImage.offsetWidth;
    const renderHeight = renderImage.offsetHeight;

    let row = 0, col = 0;
    // Loop through gabariCodes and gabariImages
    for (let i = 0; i < gabariCodes.length; i++) {
        // Create a wrapper div for each gabari
        const wrapper = document.createElement("div");
        wrapper.className = "gabari-wrapper";
        wrapper.setAttribute("data-zone", zone); // Add zone attribute

        // Scale percentages to pixels based on renderImage dimensions
        const topInPixels = (parseFloat(zonePosition.top) / 100) * renderHeight;
        const leftInPixels = (parseFloat(zonePosition.left) / 100) * renderWidth; 
        
        // Adjust wrapper position for stacking
        wrapper.style.top = `${topInPixels + row * 90}px`;
        wrapper.style.left = `${leftInPixels + col * 80}px`;

        // Increment column, adjust row if necessary
        col++;
        if (col >= 3) {
            col = 0;
            row++;
        }

        // Create the image element
        const image = document.createElement("img");
        image.src = gabariImages[i];
        image.alt = `Gabari Image ${gabariCodes[i]}`;

        // Create the code element
        const code = document.createElement("div");
        code.textContent = gabariCodes[i];
        code.style.marginTop = "5px";
        code.style.backgroundColor = "white";

        wrapper.appendChild(image);
        wrapper.appendChild(code);

        // Add the wrapper to the render container
        renderContainer.appendChild(wrapper);
    }
}

function maximizeImages(wrapper) {
    if (!(wrapper instanceof Node)) {
        console.error("Invalid wrapper:", wrapper);
        return null; // Handle the error gracefully
    }

    const fullScreenOverlay = document.createElement("div");
    fullScreenOverlay.className = "fullScreenOverlay";

    const fullScreenImage = document.createElement("img");
    fullScreenImage.className = "fullScreenImage";
    fullScreenImage.src = wrapper.querySelector("img").src;
    fullScreenImage.classList.add("fullScreenImage");

    fullScreenImage.querySelectorAll(":not(img)").forEach(node => node.remove());

    fullScreenOverlay.appendChild(fullScreenImage);
    return fullScreenOverlay;
}

document.getElementById("findProduct").addEventListener("click", () => {
    const productCode = document.getElementById("productCode").value;
    findProduct(productCode); // This will display the render and draw gabari points
});

document.getElementById("render-container").addEventListener("click", (event) => {
    // Check if the clicked element has the class "gabari-wrapper"
    let wrapper = event.target.closest(".gabari-wrapper");
    
    if (wrapper) {
        console.log("Gabari wrapper clicked:", wrapper);

        const fullScreenOverlay = maximizeImages(wrapper);
        document.body.appendChild(fullScreenOverlay);

        // Close fullscreen on click
        fullScreenOverlay.addEventListener("click", () => {
            document.body.removeChild(fullScreenOverlay);
        });
    } else {
        console.error("Invalid target:", event.target);
    }
});

document.getElementById("render-container").addEventListener("click", (event) => {
    let point = event.target.closest(".gabari-point");

    if (point) {
        const zone = point.getAttribute("data-zone");
        toggleView(zone); // Pass the zone to toggleView
    } else {
        console.error("Invalid target:", event.target);
    }
});

function toggleView(zone) {

            // Toggle state for the clicked point
            showGabarisMap[zone] = !showGabarisMap[zone];

            if (showGabarisMap[zone]) {
                // Fetch gabaris for the clicked zone
                const productCode = document.getElementById("productCode").value;
                console.log("Product code before calling detect gabaris: ", productCode);

                const { gabariCodes, gabariImages } = detectGabaris(productCode, zone);
                console.log("Gabari Codes: ", gabariCodes);
                // Draw only the gabaris for this zone
                drawGabaris(zonePositions[zone], gabariCodes, gabariImages, zone);
            } else {
                // If toggled off, remove the gabaris from this zone
                const existingWrappers = document.querySelectorAll(`.gabari-wrapper[data-zone="${zone}"]`);
                existingWrappers.forEach((wrapper) => wrapper.remove());
            }
    };

// Load data on page load
window.onload = loadData;