import { CONSTANTS } from './config.js';

let canvas;

export function initCanvas(canvasId, updateCallback) {
    const widthPx = CONSTANTS.DESIGN_MODULE_WIDTH_MM * CONSTANTS.PIXELS_PER_MM;
    const heightPx = CONSTANTS.FIXED_CANVAS_HEIGHT_MM * CONSTANTS.PIXELS_PER_MM;

    if (!canvas) {
        canvas = new fabric.Canvas(canvasId, {
            width: widthPx,
            height: heightPx,
            backgroundColor: null, 
            preserveObjectStacking: true 
        });
        
        // Quando cambia qualcosa, chiamiamo la callback (che aggiornerà Alpine -> 3D)
        canvas.on('object:modified', updateCallback);
        canvas.on('object:added', updateCallback);
        canvas.on('object:removed', updateCallback);
    } else {
        canvas.setWidth(widthPx);
        canvas.setHeight(heightPx);
        canvas.renderAll();
    }
}

// MOD: Accetta i parametri direttamente
export function addText(textValue, fontName, colorValue) {
    if(!canvas) return;
    
    const text = new fabric.IText(textValue || 'TESTO', {
        left: 50, top: 20,
        fontFamily: fontName || 'Arial', 
        fill: colorValue || '#000000',
        fontSize: 60
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
}

export function setFont(fontName) {
    if(!canvas) return;
    const objects = canvas.getObjects();
    let changed = false;
    objects.forEach((obj) => {
        if (obj.type === 'i-text' || obj.type === 'text') {
            obj.set("fontFamily", fontName);
            changed = true;
        }
    });
    if (changed) {
        canvas.requestRenderAll();
        canvas.fire('object:modified'); // Triggera updateCallback
    }
}

export function addImage(file) {
    if(!canvas || !file) return;
    const reader = new FileReader();
    reader.onload = function(f) {
        const data = f.target.result;
        fabric.Image.fromURL(data, function(img) {
            const maxDim = 300; 
            if(img.width > maxDim || img.height > maxDim) {
                img.scaleToWidth(maxDim);
            }
            img.set({ left: 50, top: 50 });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        });
    };
    reader.readAsDataURL(file);
}

export function removeSelected() {
    if(!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
        canvas.remove(activeObj);
        canvas.discardActiveObject(); 
        canvas.renderAll();
    } else {
        alert("Seleziona prima un elemento da eliminare!");
    }
}

export function getSnapshot() {
    if(!canvas) return null;
    return canvas.toDataURL({ format: 'png', multiplier: 1 });
}