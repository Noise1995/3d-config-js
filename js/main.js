import { init3D, updateModelScale } from './scene3d.js';
import { initCanvas, addText, setFont, addImage, removeSelected } from './editor2d.js';
import { updateCompositeArtwork } from './composer.js';
import { state, updatePatchParam } from './state.js';
import { TAPE_MODELS, CONSTANTS } from './config.js';

// ==========================================
// DEBUG UI
// ==========================================
function updateDebugUI() {
    const updateUIForPatch = (idx, prefix) => {
        const patch = state.debugParams.patches[idx];
        if(!patch) return;

        const elX = document.getElementById(`${prefix}-x`);
        const elY = document.getElementById(`${prefix}-y`);
        const elRot = document.getElementById(`${prefix}-rot`);
        const elScale = document.getElementById(`${prefix}-scale`);

        if(elX) elX.value = patch.x;
        if(elY) elY.value = patch.y;
        if(elRot) elRot.value = patch.rot;
        if(elScale) elScale.value = patch.scale;

        if (document.getElementById(`val-${prefix}-x`)) document.getElementById(`val-${prefix}-x`).innerText = patch.x.toFixed(2);
        if (document.getElementById(`val-${prefix}-y`)) document.getElementById(`val-${prefix}-y`).innerText = patch.y.toFixed(2);
        if (document.getElementById(`val-${prefix}-rot`)) document.getElementById(`val-${prefix}-rot`).innerText = patch.rot + '°';
        if (document.getElementById(`val-${prefix}-scale`)) document.getElementById(`val-${prefix}-scale`).innerText = patch.scale.toFixed(2);
    };

    updateUIForPatch(0, 'p1');
    updateUIForPatch(1, 'p2');
}

window.updateDebugParams = function() {
    const readInput = (id) => parseFloat(document.getElementById(id).value);

    // Patch 1
    updatePatchParam(0, 'x', readInput('p1-x'));
    updatePatchParam(0, 'y', readInput('p1-y'));
    updatePatchParam(0, 'rot', readInput('p1-rot'));
    updatePatchParam(0, 'scale', readInput('p1-scale'));

    // Patch 2
    updatePatchParam(1, 'x', readInput('p2-x'));
    updatePatchParam(1, 'y', readInput('p2-y'));
    updatePatchParam(1, 'rot', readInput('p2-rot'));
    updatePatchParam(1, 'scale', readInput('p2-scale'));

    updateDebugUI(); 
    if (state.currentStep === 2) updateCompositeArtwork();
};

// ==========================================
// EDITOR UI
// ==========================================
window.addTextToCanvas = function() {
    addText();
};

window.changeFont = function(fontName) {
    setFont(fontName);
};

window.handleImageUpload = function(event) {
    const file = event.target.files[0];
    if(file) {
        addImage(file);
        event.target.value = ''; 
    }
};

window.deleteSelected = function() {
    removeSelected();
};

// ==========================================
// NAVIGATION & OPTIONS
// ==========================================
window.nextStep = function() {
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
    state.currentStep = 2;
    
    initCanvas('editor-canvas', updateCompositeArtwork);
    setTimeout(() => updateCompositeArtwork(), 100);
};

window.prevStep = function() {
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    state.currentStep = 1;
};

window.selectOption = function(type, value, btnElement) {
    state.config[type] = value;
    
    const containerId = type === 'width' ? 'width-options' : (type === 'length' ? 'length-options' : 'material-options');
    const container = document.getElementById(containerId);
    if(container) Array.from(container.children).forEach(b => b.classList.remove('selected'));
    if(btnElement) btnElement.classList.add('selected');

    // === GESTIONE CAMBIO LARGHEZZA ===
    if (type === 'width') {
        // SINCRONIZZAZIONE PERFETTA:
        // Chiediamo di generare la texture corretta (Compensata per la nuova larghezza).
        // Passiamo 'updateModelScale' come callback da eseguire SOLO quando la texture è pronta.
        
        updateCompositeArtwork(function() {
            // Questo viene eseguito DOPO che la texture è caricata e applicata
            updateModelScale();
        });
    }

    calculateBasePrice();
    document.getElementById('btn-next-1').disabled = false;
};

function calculateBasePrice() {
    const modelData = TAPE_MODELS[state.config.model];
    let price = modelData.basePrice;
    const wKey = `width_${state.config.width}`;
    if (modelData.pricing[wKey]) price *= modelData.pricing[wKey];
    
    state.config.unitPrice = price;
    const priceEl = document.getElementById('base-price-display');
    if(priceEl) priceEl.innerText = price.toFixed(2) + ' €/rotolo';
}

function renderStep1Options() {
    const data = TAPE_MODELS[CONSTANTS.DEFAULT_MODEL];
    
    const wDiv = document.getElementById('width-options');
    wDiv.innerHTML = '';
    data.widths.forEach(w => {
        const btn = document.createElement('span');
        btn.className = 'option-button';
        if(w === state.config.width) btn.classList.add('selected');
        btn.innerText = w + ' mm';
        btn.onclick = (e) => window.selectOption('width', w, e.target);
        wDiv.appendChild(btn);
    });

    const lDiv = document.getElementById('length-options');
    lDiv.innerHTML = '';
    data.lengths.forEach(l => {
        const btn = document.createElement('span');
        btn.className = 'option-button';
        if(l === state.config.length) btn.classList.add('selected');
        btn.innerText = l + ' m';
        btn.onclick = (e) => window.selectOption('length', l, e.target);
        lDiv.appendChild(btn);
    });

    const mDiv = document.getElementById('material-options');
    if(mDiv) {
        mDiv.innerHTML = '';
        data.materials.forEach(mat => {
            const btn = document.createElement('span');
            btn.className = 'material-button';
            if(mat.id === state.config.materialId) btn.classList.add('selected');
            btn.innerText = mat.name;
            btn.style.borderLeft = `5px solid ${mat.previewColor}`;
            btn.onclick = (e) => window.selectOption('materialId', mat.id, e.target);
            mDiv.appendChild(btn);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init3D('preview-3d', 'loading-msg');
    renderStep1Options();
    calculateBasePrice();
    updateDebugUI(); 
});