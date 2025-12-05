import { getBaseTextureImage } from './scene3d.js';
import { getSnapshot } from './editor2d.js';
import { CONSTANTS } from './config.js';

// MOD: Accetta widthMm e patchesArray come argomenti
export function updateCompositeArtwork(widthMm, patchesArray, onResult) {
    const safeCallback = (typeof onResult === 'function') ? onResult : () => {};

    const patchData = getSnapshot(); 
    if (!patchData) {
        // Nessuna patch dal canvas 2D, ritorna null
        safeCallback(null);
        return;
    }

    const bgImageSrc = getBaseTextureImage();
    const imgPatch = new Image();
    imgPatch.src = patchData;

    imgPatch.onload = function() {
        const imgBg = new Image();
        imgBg.crossOrigin = "Anonymous";
        
        imgBg.onload = () => {
            const MASTER_W = imgBg.width;
            const MASTER_H = imgBg.height;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = MASTER_W;
            tempCanvas.height = MASTER_H;
            const ctx = tempCanvas.getContext('2d');

            // 1. Sfondo
            ctx.drawImage(imgBg, 0, 0, MASTER_W, MASTER_H);

            // Calcolo compensazione usando widthMm passato
            const stretchFactor = widthMm / CONSTANTS.BASE_3D_WIDTH_MM;
            const manualTweak = CONSTANTS.STRETCH_CORRECTION[widthMm.toString()];
            const compensationY = manualTweak !== undefined ? manualTweak : (1 / stretchFactor);

            // 2. Patches
            const patchW = imgPatch.width;
            const patchH = imgPatch.height;

            // Usa patchesArray passato dall'argomento
            if (patchesArray && Array.isArray(patchesArray)) {
                patchesArray.forEach((patch) => {
                    const posX = MASTER_W * patch.x;
                    const posY = MASTER_H * patch.y;

                    ctx.save();
                    
                    ctx.translate(posX, posY);
                    ctx.scale(1, compensationY);
                    ctx.rotate((patch.rot * Math.PI) / 180);
                    ctx.scale(patch.scale, patch.scale);
                    ctx.drawImage(imgPatch, -patchW / 2, -patchH / 2, patchW, patchH);
                    
                    ctx.restore();
                });
            }

            const finalData = tempCanvas.toDataURL('image/png');
            
            // Restituisce l'URL generato invece di settare lo stato
            safeCallback(finalData);
        };

        imgBg.src = bgImageSrc;
    };
}