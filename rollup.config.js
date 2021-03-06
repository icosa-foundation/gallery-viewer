import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss'
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import glslify from 'rollup-plugin-glslify';

const license = `/*!
 * Icosa Viewer
 * https://github.com/icosa-gallery/icosa-viewer
 * Copyright (c) 2021 Icosa Gallery
 * Released under the Apache 2.0 Licence.
 */`;

const globals =  {
	'three': 'THREE',
	'three/examples/jsm/webxr/VRButton': 'VRButton',
	//'three/examples/jsm/loaders/TiltLoader': 'TiltLoader',
	'three/examples/jsm/libs/fflate.module.min.js':'fflate_module_min_js',
	'camera-controls': 'CameraControls',
	'hold-event': 'holdEvent'
}

export default {
	input: 'src/index.ts',
	external: ['three', 'camera-controls', 'hold-event'],
	output: [
		{
			format: 'umd',
			name: 'IcosaViewer',
			file: 'dist/icosa-viewer.js',
			banner: license,
			indent: '\t',
			globals: globals
		},
		{
			format: 'es',
			file: 'dist/icosa-viewer.module.js',
			banner: license,
			indent: '\t',
			globals: globals
		},
	],
	plugins: [
		peerDepsExternal(),
		typescript( { typescript: require( 'typescript' ) } ),
		glslify(),
        postcss( { plugins: [] } )
	]
};
