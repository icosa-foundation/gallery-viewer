import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import url from 'postcss-url';
import dts from 'rollup-plugin-dts';

const license = `/*!
 * Icosa Viewer
 * https://github.com/icosa-gallery/icosa-viewer
 * Copyright (c) 2021-2022 Icosa Gallery
 * Released under the Apache 2.0 Licence.
 */`;

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				format: 'umd',
				name: 'IcosaViewer',
				file: 'dist/icosa-viewer.js',
				banner: license,
				indent: '\t',
			},
			{
				format: 'es',
				file: 'dist/icosa-viewer.module.js',
				banner: license,
				indent: '\t',
			},
		],
		plugins: [
			nodeResolve(),
			typescript( { typescript: require( 'typescript' ) } ),
			postcss( { 
				plugins: [
					url({ url: 'inline' })
				] 
			} )
		]
	},
	{
		input: 'src/index.ts',
		output: [
			{
				format: 'es',
				file: 'dist/icosa-viewer.d.ts',
			}
		],
		plugins: [dts()]
	}
];
