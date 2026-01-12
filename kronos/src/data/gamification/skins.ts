export type SkinSlot = 'BASE' | 'AURA' | 'TATTOO' | 'ARTIFACT' | 'MASK'

export interface SkinItem {
    id: string
    slot: SkinSlot
    name: string
    description: string
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
    unlockLevel?: number
    unlockAchievement?: string // Code of the achievement
    visualAsset: string // Path or CSS class
}

export const SKIN_CATALOG: SkinItem[] = [
    // --- BASE (HEADS) ---
    {
        id: 'base_fem_novice',
        slot: 'BASE',
        name: 'Novice (Fem)',
        description: 'O começo da jornada para iniciadas.',
        rarity: 'COMMON',
        visualAsset: '/assets/gamification/avatars/heads/fem_0_0.png'
    },
    {
        id: 'base_fem_artisan',
        slot: 'BASE',
        name: 'Artisan (Fem)',
        description: 'Domínio básico das ferramentas.',
        rarity: 'RARE',
        unlockLevel: 10,
        visualAsset: '/assets/gamification/avatars/heads/fem_0_1.png'
    },
    {
        id: 'base_fem_resident',
        slot: 'BASE',
        name: 'Resident (Fem)',
        description: 'Artista estabelecida no ecossistema.',
        rarity: 'RARE',
        unlockLevel: 20,
        visualAsset: '/assets/gamification/avatars/heads/fem_0_2.png'
    },
    {
        id: 'base_fem_master',
        slot: 'BASE',
        name: 'Master (Fem)',
        description: 'Maestria técnica e reconhecimento.',
        rarity: 'EPIC',
        unlockLevel: 40,
        visualAsset: '/assets/gamification/avatars/heads/fem_0_3.png'
    },
    {
        id: 'base_fem_legend',
        slot: 'BASE',
        name: 'Legend (Fem)',
        description: 'Lenda viva do estúdio.',
        rarity: 'LEGENDARY',
        unlockLevel: 80,
        visualAsset: '/assets/gamification/avatars/heads/fem_0_4.png'
    },
    {
        id: 'base_gen_0',
        slot: 'BASE',
        name: 'Iniciado Masculino',
        description: 'Visual padrão para iniciados.',
        rarity: 'COMMON',
        visualAsset: '/assets/gamification/avatars/heads/gen_0_0.png'
    },
    {
        id: 'base_div_black_f',
        slot: 'BASE',
        name: 'Artesã de Raízes',
        description: 'Estilo cyber-roots.',
        rarity: 'RARE',
        unlockLevel: 10,
        visualAsset: '/assets/gamification/avatars/heads/div_0_0.png'
    },
    {
        id: 'base_div_asian_m',
        slot: 'BASE',
        name: 'Andarilho de Neon',
        description: 'Visual tecnológico e moderno.',
        rarity: 'RARE',
        unlockLevel: 10,
        visualAsset: '/assets/gamification/avatars/heads/div_1_1.png'
    },
    {
        id: 'base_div_indigenous',
        slot: 'BASE',
        name: 'Xamã Urbano',
        description: 'Conexão ancestral e digital.',
        rarity: 'EPIC',
        unlockLevel: 25,
        visualAsset: '/assets/gamification/avatars/heads/div_2_4.png'
    },

    // --- MASK ---
    {
        id: 'mask_cyber_geisha',
        slot: 'MASK',
        name: 'Cyber-Geisha',
        description: 'Elegância e mistério com síntese digital.',
        rarity: 'EPIC',
        unlockAchievement: 'HIGH_ROLLER',
        visualAsset: '/assets/gamification/avatars/masks/fem_1_0.png'
    },
    {
        id: 'mask_headset',
        slot: 'MASK',
        name: 'Headset',
        description: 'Foco total nas batidas do Kronos.',
        rarity: 'COMMON',
        visualAsset: '/assets/gamification/avatars/masks/fem_1_1.png'
    },
    {
        id: 'mask_face_veil',
        slot: 'MASK',
        name: 'Face Veil',
        description: 'Proteção etérea contra o ruído analógico.',
        rarity: 'RARE',
        unlockLevel: 15,
        visualAsset: '/assets/gamification/avatars/masks/fem_1_2.png'
    },
    {
        id: 'mask_breathing_choker',
        slot: 'MASK',
        name: 'Breathing Choker',
        description: 'Suporte vital para ambientes de alta pressão.',
        rarity: 'RARE',
        unlockLevel: 30,
        visualAsset: '/assets/gamification/avatars/masks/fem_1_3.png'
    },
    {
        id: 'mask_void_crown',
        slot: 'MASK',
        name: 'Void Crown',
        description: 'A coroa de quem domina o vazio.',
        rarity: 'LEGENDARY',
        unlockLevel: 50,
        visualAsset: '/assets/gamification/avatars/masks/fem_1_4.png'
    },
    {
        id: 'mask_respirator',
        slot: 'MASK',
        name: 'Respirador Básico',
        description: 'Essencial para longas sessões.',
        rarity: 'COMMON',
        visualAsset: '/assets/gamification/avatars/masks/gen_1_0.png'
    },
    {
        id: 'mask_oni',
        slot: 'MASK',
        name: 'Oni de Neon',
        description: 'Tradição e tecnologia unidas.',
        rarity: 'RARE',
        unlockLevel: 15,
        visualAsset: '/assets/gamification/avatars/masks/gen_1_1.png'
    },

    // --- ARTIFACT ---
    {
        id: 'art_tattoo_artifacts',
        slot: 'ARTIFACT',
        name: 'Tattoo Artifacts',
        description: 'Relíquias sagradas da tatuagem moderna.',
        rarity: 'COMMON',
        visualAsset: '/assets/gamification/avatars/artifacts/fem_2_0.png'
    },
    {
        id: 'art_levitating_ink_sphere',
        slot: 'ARTIFACT',
        name: 'Levitating Ink Sphere',
        description: 'Manipulação absoluta de pigmentos.',
        rarity: 'LEGENDARY',
        unlockLevel: 80,
        visualAsset: '/assets/gamification/avatars/artifacts/fem_2_1.png'
    },
    {
        id: 'art_needle',
        slot: 'ARTIFACT',
        name: 'Needle',
        description: 'A ferramenta essencial elevada ao extremo.',
        rarity: 'RARE',
        unlockLevel: 10,
        visualAsset: '/assets/gamification/avatars/artifacts/fem_2_2.png'
    },
    {
        id: 'art_nanobot_swarm_controller',
        slot: 'ARTIFACT',
        name: 'Nanobot Swarm Controller',
        description: 'Precisão orgânica através de enxames digitais.',
        rarity: 'EPIC',
        unlockLevel: 40,
        visualAsset: '/assets/gamification/avatars/artifacts/fem_2_3.png'
    },
    {
        id: 'art_energy_stylus',
        slot: 'ARTIFACT',
        name: 'Energy Stylus',
        description: 'Luz sólida moldando a pele.',
        rarity: 'RARE',
        unlockLevel: 25,
        visualAsset: '/assets/gamification/avatars/artifacts/fem_2_4.png'
    },
    {
        id: 'art_classic_coil',
        slot: 'ARTIFACT',
        name: 'Bobina Ancestral',
        description: 'Old school nunca falha.',
        rarity: 'COMMON',
        visualAsset: '/assets/gamification/avatars/artifacts/gen_2_0.png'
    },
    {
        id: 'art_laser_needle',
        slot: 'ARTIFACT',
        name: 'Agulha de Laser',
        description: 'Precisão subatômica.',
        rarity: 'RARE',
        unlockLevel: 20,
        visualAsset: '/assets/gamification/avatars/artifacts/gen_2_3.png'
    }
]
