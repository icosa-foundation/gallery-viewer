import { RepeatWrapping, TextureLoader, Vector3, Vector4 } from 'three';

import diamondHullVert from './brushes/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901-v10.0-vertex.glsl';
import diamondHullFrag from './brushes/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901-v10.0-fragment.glsl';

import icingVert from './brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-vertex.glsl';
import icingFrag from './brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-fragment.glsl';

import lightVert from './brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-vertex.glsl';
import lightFrag from './brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-fragment.glsl';

import matteHullVert from './brushes/MatteHull-79348357-432d-4746-8e29-0e25c112e3aa/MatteHull-79348357-432d-4746-8e29-0e25c112e3aa-v10.0-vertex.glsl';
import matteHullFrag from './brushes/MatteHull-79348357-432d-4746-8e29-0e25c112e3aa/MatteHull-79348357-432d-4746-8e29-0e25c112e3aa-v10.0-fragment.glsl';

import neonPulseVert from './brushes/NeonPulse-b2ffef01-eaaa-4ab5-aa64-95a2c4f5dbc6/NeonPulse-b2ffef01-eaaa-4ab5-aa64-95a2c4f5dbc6-v10.0-vertex.glsl';
import neonPulseFrag from './brushes/NeonPulse-b2ffef01-eaaa-4ab5-aa64-95a2c4f5dbc6/NeonPulse-b2ffef01-eaaa-4ab5-aa64-95a2c4f5dbc6-v10.0-fragment.glsl';

import oilPaintVert from './brushes/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699-v10.0-vertex.glsl';
import oilPaintFrag from './brushes/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699-v10.0-fragment.glsl';

import smokeVert from './brushes/Smoke-70d79cca-b159-4f35-990c-f02193947fe8/Smoke-70d79cca-b159-4f35-990c-f02193947fe8-v10.0-vertex.glsl';
import smokeFrag from './brushes/Smoke-70d79cca-b159-4f35-990c-f02193947fe8/Smoke-70d79cca-b159-4f35-990c-f02193947fe8-v10.0-fragment.glsl';

import splatterVert from './brushes/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e-v10.0-vertex.glsl';
import splatterFrag from './brushes/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e-v10.0-fragment.glsl';

import toonVert from './brushes/Toon-4391385a-df73-4396-9e33-31e4e4930b27/Toon-4391385a-df73-4396-9e33-31e4e4930b27-v10.0-vertex.glsl';
import toonFrag from './brushes/Toon-4391385a-df73-4396-9e33-31e4e4930b27/Toon-4391385a-df73-4396-9e33-31e4e4930b27-v10.0-fragment.glsl';

import unlitHullVert from './brushes/UnlitHull-a8fea537-da7c-4d4b-817f-24f074725d6d/UnlitHull-a8fea537-da7c-4d4b-817f-24f074725d6d-v10.0-vertex.glsl';
import unlitHullFrag from './brushes/UnlitHull-a8fea537-da7c-4d4b-817f-24f074725d6d/UnlitHull-a8fea537-da7c-4d4b-817f-24f074725d6d-v10.0-fragment.glsl';

import wireVert from './brushes/Wire-4391385a-cf83-4396-9e33-31e4e4930b27/Wire-4391385a-cf83-4396-9e33-31e4e4930b27-v10.0-vertex.glsl';
import wireFrag from './brushes/Wire-4391385a-cf83-4396-9e33-31e4e4930b27/Wire-4391385a-cf83-4396-9e33-31e4e4930b27-v10.0-fragment.glsl';


const TiltBrushShaders = {
	"DiamondHull" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_time: { value: new Vector4() },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			cameraPosition: { value: new Vector3() },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901-v10.0-MainTex.png',
			function (texture) {
				texture.name = "DiamondHull_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    }) 
		    },
		},
		vertexShader: diamondHullVert,
		fragmentShader: diamondHullFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
	"Icing" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    }) 
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    }) 
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"Light" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-MainTex.png',
			function (texture) {
				texture.name = "Light_MainTex";
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
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
	"MatteHull" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: matteHullVert,
		fragmentShader: matteHullFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
	"NeonPulse" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_time: { value: new Vector4() },
			u_EmissionGain: { value: 0.45 },
		},
		vertexShader: neonPulseVert,
		fragmentShader: neonPulseFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
	"OilPaint": {
		uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0020, 0.0020, 512, 512) },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699-v10.0-MainTex.png', 
				function (texture) {
					texture.name = "OilPaint_MainTex";
					texture.wrapS = RepeatWrapping;
					texture.wrapT = RepeatWrapping;
					texture.flipY = false;
				}) 
			},
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699-v10.0-BumpMap.png', 
				function (texture) {
					texture.name = "OilPaint_BumpMap";
					texture.wrapS = RepeatWrapping;
					texture.wrapT = RepeatWrapping;
					texture.flipY = false;
				}) 
			}
		},
		vertexShader: oilPaintVert,
		fragmentShader: oilPaintFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0
	},
	"Smoke": {
		uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_TintColor: { value: new Vector4(1, 1, 1, 1) },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Smoke-70d79cca-b159-4f35-990c-f02193947fe8/Smoke-70d79cca-b159-4f35-990c-f02193947fe8-v10.0-MainTex.png', 
				function (texture) {
					texture.name = "Smoke_MainTex";
					texture.wrapS = RepeatWrapping;
					texture.wrapT = RepeatWrapping;
					texture.flipY = false;
				}) 
			}
		},
		vertexShader: smokeVert,
		fragmentShader: smokeFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
	},
	"Splatter" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e-v10.0-MainTex.png',
			function (texture) {
				texture.name = "Splatter_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    }) 
		    },
			u_Cutoff: { value: 0.2 },
		},
		vertexShader: splatterVert,
		fragmentShader: splatterFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0
    },
	"Toon" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: toonVert,
		fragmentShader: toonFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
	"UnlitHull" : {
        uniforms: {
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: unlitHullVert,
		fragmentShader: unlitHullFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
	"Wire" : {
        uniforms: {
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: wireVert,
		fragmentShader: wireFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
}

export { TiltBrushShaders };