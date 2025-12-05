import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TEXTURE_FILES, CONSTANTS } from './config.js';

let scene, camera, renderer, controls, tapeRoll, meshMaterial;
let loadedTextures = {};

export function init3D(containerId, loadingId) {

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`[3D] ERRORE CRITICO: Contenitore #${containerId} non trovato nel DOM!`);
        return;
    }

    // DEBUG DIMENSIONI
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) {
        console.warn("[3D] ATTENZIONE: Il contenitore ha dimensione 0! Il canvas sarà invisibile. Controlla il CSS o 'display: none'.");
    }
    
    // Inizializzazione Scena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); 

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2, 4, 6); 

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Aggiunta al DOM
    container.innerHTML = ''; // Pulisce eventuali tentativi precedenti
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 0.5;
    controls.maxDistance = 100;

    const loadingMsg = document.getElementById(loadingId);
    if(loadingMsg) loadingMsg.style.display = 'block';

    // Caricamento HDRI Environment
    new RGBELoader()
        .setPath('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/')
        .load('studio_small_09_1k.hdr', function (texture) {
            console.log("[3D] HDRI caricato con successo.");
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            
            // Avvia caricamento texture del modello
            loadAssets(loadingMsg);
        }, undefined, function(err) {
            console.error("[3D] Errore caricamento HDRI:", err);
        });

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Gestione Resize Finestra
    window.addEventListener('resize', () => {
        if (!container) return;
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
    });
}

function loadAssets(loadingMsg) {
    console.log("🎨 [3D] Inizio caricamento Texture materiali...");
    const textureLoader = new THREE.TextureLoader();
    let loadedCount = 0;
    const totalTextures = Object.keys(TEXTURE_FILES).length;

    for (const [key, path] of Object.entries(TEXTURE_FILES)) {
        textureLoader.load(path, (tex) => {
            tex.colorSpace = (key === 'map') ? THREE.SRGBColorSpace : THREE.NoColorSpace;
            tex.flipY = true; 
            loadedTextures[key] = tex;
            loadedCount++;
            
            if(loadedCount === totalTextures) {
                loadModel(loadingMsg);
            }
        }, undefined, (err) => {
            console.error(`[3D] Errore caricamento texture '${path}':`, err);
        });
    }
}

function loadModel(loadingMsg) {
    const loader = new GLTFLoader();
    
    loader.load('model/duct_tape.glb', (gltf) => {
        tapeRoll = gltf.scene;
        
        tapeRoll.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Creazione Materiale
                meshMaterial = new THREE.MeshStandardMaterial({
                    map: loadedTextures.map, 
                    normalMap: loadedTextures.normalMap,
                    roughnessMap: loadedTextures.roughnessMap,

                    metalnessMap: loadedTextures.metallicMap,
                    
                    aoMap: loadedTextures.aoMap,
                    side: THREE.DoubleSide
                });
                child.material = meshMaterial;
            }
        });
        
        // Centratura
        const box = new THREE.Box3().setFromObject(tapeRoll);
        tapeRoll.position.sub(box.getCenter(new THREE.Vector3()));
        
        // Scala Iniziale
        updateModelScale(CONSTANTS.DEFAULT_WIDTH_MM || 50);

        scene.add(tapeRoll);

        if(loadingMsg) loadingMsg.style.display = 'none';
        
        // Avvio Loop
        animate();

    }, undefined, (err) => {
        if(loadingMsg) loadingMsg.innerText = "Errore Caricamento Modello";
    });
}

export function updateTexture(urlPreview, onTextureReady) {
    const safeCallback = (typeof onTextureReady === 'function') ? onTextureReady : () => {};

    if (!meshMaterial) {
        safeCallback();
        return;
    }
    
    if (!urlPreview) {
        meshMaterial.map = loadedTextures.map;
        meshMaterial.needsUpdate = true;
        safeCallback();
        return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(urlPreview, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = true; 
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        texture.center.set(0.5, 0.5);
        texture.rotation = 0; 
        texture.offset.set(0, 0); 

        meshMaterial.map = texture;
        meshMaterial.needsUpdate = true;
        
        safeCallback();
    });
}

export function getBaseTextureImage() {
    if(loadedTextures.map && loadedTextures.map.image) {
        return loadedTextures.map.image.src;
    }
    return TEXTURE_FILES.map;
}

export function updateModelScale(widthMm) {
    if (!tapeRoll || !widthMm) return;

    const BASE_WIDTH_MM = CONSTANTS.BASE_3D_WIDTH_MM; 
    const scaleFactor = widthMm / BASE_WIDTH_MM;

    tapeRoll.scale.set(1, scaleFactor, 1);
}

function animate() {
    requestAnimationFrame(animate);
    if(controls) controls.update();
    if(renderer && scene && camera) renderer.render(scene, camera);
}