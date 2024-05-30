/*!
 * three-tiltloader
 * https://github.com/icosa-gallery/three-tiltloader
 * Copyright (c) 2021-2022 Icosa Gallery
 * Released under the Apache 2.0 Licence.
 */
import { Loader, FileLoader, Group, Clock, Mesh, Vector4, BufferGeometry, Vector3, Quaternion, BufferAttribute } from 'three';
import * as fflate from 'three/examples/jsm/libs/fflate.module.js';
import { TiltShaderLoader } from 'three-icosa';

// Adapted from initial TiltLoader implementation in three.js r128

class TiltLoader extends Loader {
	constructor(manager) {
		super(manager);
		this.tiltShaderLoader = new TiltShaderLoader(manager);
	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	async parse( buffer ) {

		const group = new Group();
		// https://docs.google.com/document/d/11ZsHozYn9FnWG7y3s3WAyKIACfbfwb4PbaS8cZ_xjvo/edit#

		const zip = fflate.unzipSync( new Uint8Array( buffer.slice( 16 ) ) );

		/*
		const thumbnail = zip[ 'thumbnail.png' ].buffer;
		const img = document.createElement( 'img' );
		img.src = URL.createObjectURL( new Blob( [ thumbnail ] ) );
		document.body.appendChild( img );
		*/

		const metadata = JSON.parse( fflate.strFromU8( zip[ 'metadata.json' ] ) );

		/*
		const blob = new Blob( [ zip[ 'data.sketch' ].buffer ], { type: 'application/octet-stream' } );
		window.open( URL.createObjectURL( blob ) );
		*/

		const data = new DataView( zip[ 'data.sketch' ].buffer );

		const num_strokes = data.getInt32( 16, true );

		const brushes = {};

		let offset = 20;

		for ( let i = 0; i < num_strokes; i ++ ) {

			const brush_index = data.getInt32( offset, true );

			const brush_color = [
				data.getFloat32( offset + 4, true ),
				data.getFloat32( offset + 8, true ),
				data.getFloat32( offset + 12, true ),
				data.getFloat32( offset + 16, true )
			];
			const brush_size = data.getFloat32( offset + 20, true );
			const stroke_mask = data.getUint32( offset + 24, true );
			const controlpoint_mask = data.getUint32( offset + 28, true );

			let offset_stroke_mask = 0;
			let offset_controlpoint_mask = 0;

			for ( let j = 0; j < 4; j ++ ) {

				// TOFIX: I don't understand these masks yet

				const byte = 1 << j;
				if ( ( stroke_mask & byte ) > 0 ) offset_stroke_mask += 4;
				if ( ( controlpoint_mask & byte ) > 0 ) offset_controlpoint_mask += 4;

			}

			// console.log( { brush_index, brush_color, brush_size, stroke_mask, controlpoint_mask } );
			// console.log( offset_stroke_mask, offset_controlpoint_mask );

			offset = offset + 28 + offset_stroke_mask + 4; // TOFIX: This is wrong

			const num_control_points = data.getInt32( offset, true );

			// console.log( { num_control_points } );

			const positions = new Float32Array( num_control_points * 3 );
			const quaternions = new Float32Array( num_control_points * 4 );

			offset = offset + 4;

			for ( let j = 0, k = 0; j < positions.length; j += 3, k += 4 ) {

				positions[ j + 0 ] = data.getFloat32( offset + 0, true );
				positions[ j + 1 ] = data.getFloat32( offset + 4, true );
				positions[ j + 2 ] = data.getFloat32( offset + 8, true );

				quaternions[ k + 0 ] = data.getFloat32( offset + 12, true );
				quaternions[ k + 1 ] = data.getFloat32( offset + 16, true );
				quaternions[ k + 2 ] = data.getFloat32( offset + 20, true );
				quaternions[ k + 3 ] = data.getFloat32( offset + 24, true );

				offset = offset + 28 + offset_controlpoint_mask; // TOFIX: This is wrong

			}

			if ( brush_index in brushes === false ) {

				brushes[ brush_index ] = [];

			}

			brushes[ brush_index ].push( [ positions, quaternions, brush_size, brush_color ] );

		}

		const clock = new Clock();

		for ( const brush_index in brushes ) {

			const geometry = new StrokeGeometry( brushes[ brush_index ] );
			const materialName = this.tiltShaderLoader.lookupMaterialName(metadata.BrushIndex[ brush_index ]);

			const material = await this.tiltShaderLoader.loadAsync(materialName);
			const mesh = new Mesh( geometry, material );

			mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
				if(material.uniforms["u_time"]) {
					const elapsedTime = clock.getElapsedTime();
					// _Time from https://docs.unity3d.com/Manual/SL-UnityShaderVariables.html
                	const time = new Vector4(elapsedTime/20, elapsedTime, elapsedTime*2, elapsedTime*3);

					material.uniforms["u_time"].value = time;
				}

				if (material.uniforms["cameraPosition"]) {
                    material.uniforms["cameraPosition"].value = camera.position;
                }
			};

			group.add( mesh );
		}

		return group;

	}

	setBrushPath(path) {
		// Quick repair of path if required
		if (path.slice(path.length - 1) !== "/") {
			path += "/";
		}

		this.tiltShaderLoader.setPath(path);
	}

}

class StrokeGeometry extends BufferGeometry {

	constructor( strokes ) {

		super();

		const vertices = [];
		const colors = [];
		const uvs = [];

		const position = new Vector3();
		const prevPosition = new Vector3();

		const quaternion = new Quaternion();
		const prevQuaternion = new Quaternion();

		const vector1 = new Vector3();
		const vector2 = new Vector3();
		const vector3 = new Vector3();
		const vector4 = new Vector3();

		// size = size / 2;

		for ( const k in strokes ) {

			const stroke = strokes[ k ];
			const positions = stroke[ 0 ];
			const quaternions = stroke[ 1 ];
			const size = stroke[ 2 ];
			const color = stroke[ 3 ];

			prevPosition.fromArray( positions, 0 );
			prevQuaternion.fromArray( quaternions, 0 );

			for ( let i = 3, j = 4, l = positions.length; i < l; i += 3, j += 4 ) {

				position.fromArray( positions, i );
				quaternion.fromArray( quaternions, j );

				vector1.set( - size, 0, 0 );
				vector1.applyQuaternion( quaternion );
				vector1.add( position );

				vector2.set( size, 0, 0 );
				vector2.applyQuaternion( quaternion );
				vector2.add( position );

				vector3.set( size, 0, 0 );
				vector3.applyQuaternion( prevQuaternion );
				vector3.add( prevPosition );

				vector4.set( - size, 0, 0 );
				vector4.applyQuaternion( prevQuaternion );
				vector4.add( prevPosition );

				vertices.push( vector1.x, vector1.y, - vector1.z, 1 );
				vertices.push( vector2.x, vector2.y, - vector2.z, 1 );
				vertices.push( vector4.x, vector4.y, - vector4.z, 1 );

				vertices.push( vector2.x, vector2.y, - vector2.z, 1 );
				vertices.push( vector3.x, vector3.y, - vector3.z, 1 );
				vertices.push( vector4.x, vector4.y, - vector4.z, 1 );

				prevPosition.copy( position );
				prevQuaternion.copy( quaternion );

				colors.push( ...color );
				colors.push( ...color );
				colors.push( ...color );

				colors.push( ...color );
				colors.push( ...color );
				colors.push( ...color );

				const p1 = i / l;
				const p2 = ( i - 3 ) / l;

				uvs.push( p1, 0 );
				uvs.push( p1, 1 );
				uvs.push( p2, 0 );

				uvs.push( p1, 1 );
				uvs.push( p2, 1 );
				uvs.push( p2, 0 );

			}

		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 4 ) );
		this.setAttribute( 'color', new BufferAttribute( new Float32Array( colors ), 4 ) );
		this.setAttribute( 'uv', new BufferAttribute( new Float32Array( uvs ), 2 ) );

		this.setAttribute('a_position', this.getAttribute('position'));
		this.setAttribute('a_color', this.getAttribute('color'));
		this.setAttribute("a_texcoord0", this.getAttribute("uv"));
		//this.setAttribute("_tb_unity_texcoord_0", this.getAttribute("uv"));
	}

}

export { TiltLoader };
