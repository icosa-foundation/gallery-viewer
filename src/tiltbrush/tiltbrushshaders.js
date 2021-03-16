import lightVert from './brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-vertex.glsl'
import lightFrag from './brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-fragment.glsl'

import smokeVert from './brushes/Smoke-70d79cca-b159-4f35-990c-f02193947fe8/Smoke-70d79cca-b159-4f35-990c-f02193947fe8-v10.0-vertex.glsl'
import smokeFrag from './brushes/Smoke-70d79cca-b159-4f35-990c-f02193947fe8/Smoke-70d79cca-b159-4f35-990c-f02193947fe8-v10.0-fragment.glsl'

import splatterVert from './brushes/Splatter-8dc4a70c-d558-4efd-a5ed-d4e860f40dc3/Splatter-8dc4a70c-d558-4efd-a5ed-d4e860f40dc3-v10.0-vertex.glsl'
import splatterFrag from './brushes/Splatter-8dc4a70c-d558-4efd-a5ed-d4e860f40dc3/Splatter-8dc4a70c-d558-4efd-a5ed-d4e860f40dc3-v10.0-fragment.glsl'

const TiltBrushShaders = {
    'Light': {
        'Vert': lightVert,
        'Frag': lightFrag
    },
    'Smoke': {
        'Vert': smokeVert,
        'Frag': smokeFrag
    },
    'Splatter': {
        'Vert': splatterVert,
        'Frag': splatterFrag
    }
}

export { TiltBrushShaders };
