export const TEXTURE_FILES = {
    map: 'texture/base_color.png',
    normalMap: 'texture/normal.png',
    roughnessMap: 'texture/roughness.png',
    metallicMap: 'texture/metallic.png',
    aoMap: 'texture/ao.png'
};

export const TAPE_MODELS = {
    'kraft': {
        name: 'Nastro Carta Kraft',
        basePrice: 1.50,
        lengths: [66, 100],
        widths: [38, 50, 75],
        materials: [
            { 
                id: 'standard', 
                name: 'Standard (Base)', 
                type: 'original', 
                previewColor: '#888888',
                texturePath: TEXTURE_FILES.map 
            }
        ],
        pricing: { 'width_38': 0.9, 'width_50': 1.0, 'width_75': 1.15, 'length_66': 1.0, 'length_100': 1.5 }
    }
};

export const CONSTANTS = {
    DESIGN_MODULE_WIDTH_MM: 160,    
    PIXELS_PER_MM: 5,               
    DEFAULT_MODEL: 'kraft',
    BASE_3D_WIDTH_MM: 50,           
    FIXED_CANVAS_HEIGHT_MM: 52,
    STRETCH_CORRECTION: {
        '38': 0.8,
        '50': 1.0,
        '75': 1.25
    }
};