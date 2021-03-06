import lightVert from './brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-vertex.glsl'
import lightFrag from './brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-fragment.glsl'

import splatterVert from './brushes/Splatter-8dc4a70c-d558-4efd-a5ed-d4e860f40dc3/Splatter-8dc4a70c-d558-4efd-a5ed-d4e860f40dc3-v10.0-vertex.glsl'
import splatterFrag from './brushes/Splatter-8dc4a70c-d558-4efd-a5ed-d4e860f40dc3/Splatter-8dc4a70c-d558-4efd-a5ed-d4e860f40dc3-v10.0-fragment.glsl'

const TiltBrushShaders = {
    'Light': {
        'Vert': lightVert,
        'Frag': lightFrag
    },
    'Splatter': {
        'Vert': splatterVert,
        'Frag': splatterFrag
    }
}

export { TiltBrushShaders };
