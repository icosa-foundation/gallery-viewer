import { TextureLoader, RepeatWrapping } from 'three';

import lightVert from './brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-vertex.glsl'
import lightFrag from './brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-fragment.glsl'

const TiltBrushShaders = {
    "Light" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-MainTex.png',
			function (texture) {
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    }) 
		    },
			u_EmissionGain: { value: 0.45 },
		},
		vertexShader: lightVert,
		fragmentShader: lightFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 5,
		blendDst: 201,
		blendDstAlpha: 201,
		blendEquation: 100,
		blendEquationAlpha: 100,
		blendSrc: 201,
		blendSrcAlpha: 201,
    }
}

export { TiltBrushShaders };