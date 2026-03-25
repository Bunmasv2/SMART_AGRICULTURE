export const STAGE_ICONS: Record<string, string> = {
    "Chuẩn bị & Trồng": "🌱",
    "Sinh trưởng Thân Lá": "🍃",
    "Kích Thích Ra Hoa": "🌸",
    "Đậu Trái & Nuôi Trái": "🍋",
    "Thu Hoạch": "🧺",
};

export const STAGE_CONFIG: Record<string, { icon: string; color: string }> = {
    'Gieo trồng': { icon: '🌱', color: '#10b981' }, // Emerald
    'Cây con': { icon: '🌿', color: '#34d399' },    // Emerald 400
    'Sinh trưởng': { icon: '🌳', color: '#059669' }, // Emerald 600
    'Ra hoa': { icon: '🌸', color: '#fb7185' },    // Rose
    'Kết trái': { icon: '🍎', color: '#f43f5e' },   // Rose 500
    'Thu hoạch': { icon: '🧺', color: '#f59e0b' },  // Amber
    'default': { icon: '🍃', color: '#94a3b8' }     // Slate
};