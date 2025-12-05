# 3D Tape Configurator

A lightweight, interactive web application designed for customizing and previewing adhesive tape rolls in a three-dimensional environment. This tool utilizes modern web technologies to provide a real-time "What You See Is What You Get" (WYSIWYG) experience, allowing users to modify dimensions, materials, and graphical elements directly on the product.

## Live Demo & Author

* **Live Demo:** [https://3d-config-js.netlify.app/](https://3d-config-js.netlify.app/)
* **Author Website:** [espfra95.net](https://espfra95.net)

## Features

* **Real-time 3D Rendering:** High-fidelity rendering of the tape roll using Three.js with Physically Based Rendering (PBR) materials.
* **Interactive Configuration:** Users can modify product specifications such as width, length, and core material.
* **2D Design Editor:** Integrated canvas editor (powered by Fabric.js) allowing users to add custom text, change fonts, colors, and upload images or logos.
* **Dynamic Texture Mapping:** The 2D design is automatically composited and mapped onto the curved 3D surface with appropriate distortion correction.
* **Reactive User Interface:** Fast and responsive UI state management powered by Alpine.js.
* **Dynamic Pricing:** Real-time price calculation based on selected dimensions and materials.

## Technology Stack

* **Alpine.js:** Used for reactive state management and DOM manipulation.
* **Three.js:** Handles the 3D scene, camera, lighting, and model rendering.
* **Fabric.js:** Manages the 2D canvas for text and image manipulation.
* **JavaScript (ES6+):** Modular architecture using ES Modules.
* **HTML5 / CSS3:** Structure and styling.

## Project Structure

Getting Started
---------------

This project uses ES Modules and loads external assets (GLB models and textures). Due to browser CORS (Cross-Origin Resource Sharing) policies, it cannot be run directly from the file system (e.g., `file://`). You must use a local web server.

### Prerequisites

Ensure you have a method to serve static files. Common options include Python or Node.js.

### Installation and Execution

1.  **Clone the repository:**
    
    Bash
    
        git clone [https://github.com/your-username/3d-config-repo.git](https://github.com/your-username/3d-config-repo.git)
        cd 3d-config-repo
        
    
2.  **Start a local server:**
    
    *   **Using Python 3:**
        
        Bash
        
            python -m http.server
            
        
    *   **Using Node.js (http-server):**
        
        Bash
        
            npx http-server
            
        
3.  **Access the Application:** Open your web browser and navigate to the local address provided by your terminal (usually `http://localhost:8000` or `http://localhost:8080`).
    

Configuration
-------------

The application logic regarding product variations and pricing is centralized in `js/config.js`. You can modify this file to:

*   Update base prices.
    
*   Add new width or length options.
    
*   Define new material presets.
    
*   Adjust the pixel-to-millimeter conversion ratio.
    

Example configuration snippet:

JavaScript

    export const TAPE_MODELS = {
        'kraft': {
            basePrice: 1.50,
            widths: [38, 50, 75],
            pricing: { 
                'width_38': 0.9, 
                'width_50': 1.0 
            }
        }
    };
    

License
-------

This project is open-source and available under the MIT License.