import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/module.esm.js';
import { TAPE_MODELS, CONSTANTS } from './config.js';
import { init3D, updateModelScale, updateTexture } from './scene3d.js';
import { initCanvas, addText, setFont, addImage, removeSelected } from './editor2d.js';
import { updateCompositeArtwork } from './composer.js';

document.addEventListener('alpine:init', () => {
    Alpine.data('tapeConfigurator', () => ({
        step: 1,
        
        // Configurazione Prodotto
        config: {
            modelKey: CONSTANTS.DEFAULT_MODEL,
            width: 50,
            length: 66,
            materialId: 'standard'
        },

        // Stato Editor 2D
        editor: {
            text: '',
            font: 'Arial',
            color: '#000000'
        },

        // Parametri di Debug/Patch (ex state.js)
        patches: [
            { x: 0.93, y: 0.62, rot: 90, scale: 1.60 },
            { x: 0.93, y: 0.21, rot: 90, scale: 1.60 }
        ],

        // Lifecycle
        init() {
            
            // Ritardiamo l'avvio del 3D di 100ms per dare tempo al CSS di applicarsi
            // e al div di prendere le dimensioni (height: 450px)
            setTimeout(() => {
                init3D('preview-3d', 'loading-msg');
            }, 100);
            
            // Watcher: Se cambia la larghezza, ricalcola scala 3D e texture
            this.$watch('config.width', (val) => {
                this.refreshArtwork();
            });
        },

        // Getters
        get currentModel() {
            return TAPE_MODELS[this.config.modelKey];
        },

        get priceDisplay() {
            const data = this.currentModel;
            let price = data.basePrice;
            const wKey = `width_${this.config.width}`;
            const lKey = `length_${this.config.length}`;
            
            if (data.pricing[wKey]) price *= data.pricing[wKey];
            if (data.pricing[lKey]) price *= data.pricing[lKey]; // Assumendo ci sia pricing per lunghezza
            else if (this.config.length === 100) price *= 1.5; // Fallback logica hardcoded precedente

            return price.toFixed(2) + ' €/rotolo';
        },

        // Azioni Navigazione
        goToStep(n) {
            this.step = n;
            if (n === 2) {
                // Aspetta che Alpine mostri il div, poi inizializza il canvas
                this.$nextTick(() => {
                    initCanvas('editor-canvas', () => this.refreshArtwork());
                    // Ritardo per assicurare il rendering iniziale
                    setTimeout(() => this.refreshArtwork(), 100);
                });
            }
        },

        // Azioni Configurazione
        selectWidth(w) {
            this.config.width = w;
            // Il watcher farà il resto
        },

        // Azioni Editor
        addTextToCanvas() {
            if (!this.editor.text) return;
            addText(this.editor.text, this.editor.font, this.editor.color);
            this.editor.text = ''; // Reset input
        },

        updateFont() {
            setFont(this.editor.font);
        },

        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                addImage(file);
                event.target.value = '';
            }
        },

        deleteSelected() {
            removeSelected();
        },

        // Logica Core: Rigenera la texture e aggiorna il 3D
        refreshArtwork() {
            // Chiama il composer passandogli i dati attuali
            updateCompositeArtwork(this.config.width, this.patches, (textureUrl) => {
                // Quando la texture è pronta, aggiorna il materiale 3D
                updateTexture(textureUrl, () => {
                    // Quando il materiale è aggiornato, sistema la scala del modello
                    updateModelScale(this.config.width);
                });
            });
        }
    }));
});

Alpine.start();