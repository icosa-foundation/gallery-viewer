// Copyright 2021 Icosa Gallery
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import CameraControls from "camera-controls";
import { Color, Material, Mesh, MeshStandardMaterial, RawShaderMaterial, Scene, ShaderMaterialParameters, RepeatWrapping, TextureLoader, Object3D } from "three";
import { TiltLoader } from "three/examples/jsm/loaders/TiltLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Convert, JSONPoly } from "./JSONSchema";
import { TiltBrushShaders } from "./tiltbrush/tiltbrushshaders"; 

export class Loader {
    private scene : Scene;
    //private tiltLoader : TiltLoader;
    private gltfLoader : GLTFLoader;

    private light : ShaderMaterialParameters = {
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
		vertexShader: TiltBrushShaders.Light.Vert,
		fragmentShader: TiltBrushShaders.Light.Frag,
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

    constructor (scene : Scene, camercontrols : CameraControls) {
        //this.tiltLoader = new TiltLoader();
        this.gltfLoader = new GLTFLoader();
        this.scene = scene;
        new RawShaderMaterial()
    }

    public load(assetID : string) {
        this.gltfLoader.load(assetID, (gltf) => {
            var model = gltf.scene;
            model.traverse((object : Object3D) => {
                if(object.type === "Mesh") {
                    var mesh = object as Mesh;
                    var t = (mesh.material) as Material;

                    if(t.name === "brush_Light") {
                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("uv"));
                        mesh.material = new RawShaderMaterial(this.light);
                    }
                    else {
                        //mesh.material = new MeshStandardMaterial( { visible: false });
                    }
                }
            });
            this.scene.add(gltf.scene);
        });
    }

    public loadPoly(assetID : string) {
        const http = new XMLHttpRequest();
        const url = `https://api.icosa.gallery/poly/assets/${assetID}`;

        const that = this;
        http.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const polyAsset = Convert.toPoly(this.response);
                polyAsset.formats.forEach(format => {
                    if(format.formatType === "TILT") {
                        that.initTilt(format.root.url);
                        return;
                    }
                })
            }
        }

        http.open("GET", url, true);
        http.send();
    }

    public loadPolyURL(url : string) {
        var splitURL = url.split('/');
        if(splitURL[2] === "poly.google.com")
            this.loadPoly(splitURL[4]);
    }

    private initTilt(url : string) {
        this.scene.clear();
        // this.tiltLoader.load(url, (tilt) => {
        //     this.scene.add(tilt);
        // });
    }
}