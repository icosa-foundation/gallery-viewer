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
import { Material, Mesh, MeshStandardMaterial, RawShaderMaterial, Scene, Object3D, DirectionalLight, HemisphereLight, Vector3, IUniform, Camera, Vector4, Box3 } from "three";
import { TiltLoader } from "three/examples/jsm/loaders/TiltLoader";
import { LegacyGLTFLoader } from "./Legacy/LegacyGLTFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Convert, JSONPolyFormat } from "./JSONSchema";
import { TiltBrushShaders } from "./tiltbrush/tiltbrushshaders"; 

export class Loader {
    private scene : Scene;
    private tiltLoader : TiltLoader;
    private gltfLoader : GLTFLoader;
    private legacygltf : LegacyGLTFLoader;

    private sceneCamera : Camera;

    private cameraControls : CameraControls;

    private loadedModel? : Object3D;

    private loaded : boolean = false;

    private updateableMeshes : Mesh[] = [];

    constructor (scene : Scene, sceneCamera : Camera, cameraControls : CameraControls) {
        this.tiltLoader = new TiltLoader();
        this.gltfLoader = new GLTFLoader();
        this.legacygltf = new LegacyGLTFLoader();
        this.scene = scene;
        this.sceneCamera = sceneCamera;
        this.cameraControls = cameraControls;
        new RawShaderMaterial()
    }

    public update(deltaTime : number) {
        if(!this.loaded)
            return;

        // _Time from https://docs.unity3d.com/Manual/SL-UnityShaderVariables.html
        var time = new Vector4(deltaTime/20, deltaTime, deltaTime*2, deltaTime*3);

        // Update uniforms of meshes that need it.
        this.updateableMeshes.forEach((mesh) => {
            var material = mesh.material as Material;
            switch (material.name) {
                case "material_DiamondHull":
                    (material as RawShaderMaterial).uniforms!["cameraPosition"].value = this.sceneCamera.position;
                    (material as RawShaderMaterial).uniforms!["u_time"].value = time;
                    break;
                case "material_NeonPulse":
                    (material as RawShaderMaterial).uniforms!["u_time"].value = time;
                    break;
                case "material_Rainbow":
                    (material as RawShaderMaterial).uniforms!["u_time"].value = time;
                    break;
            }
        });
    }

    public load(assetID : string) {
        this.gltfLoader.load(assetID, (gltf) => {
            this.loadedModel = gltf.scene;
            this.loadedModel.traverse((object : Object3D) => {
                if(object.type === "Mesh") {
                    var mesh = object as Mesh;
                    var material = mesh.material as Material;
                    switch(material.name) {

                        case "brush_BlocksBasic":
                            mesh.geometry.name = "geometry_BlocksBasic";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["BlocksBasic"]);
                            mesh.material.name = "material_BlocksBasic";
                            break;

                        case "brush_BlocksGem":
                            mesh.geometry.name = "geometry_BlocksGem";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["BlocksGem"]);
                            mesh.material.name = "material_BlocksGem";
                            break;

                        case "brush_BlocksGlass":
                            mesh.geometry.name = "geometry_BlocksGlass";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["BlocksGlass"]);
                            mesh.material.name = "material_BlocksGlass";
                            break;

                        case "brush_Bubbles":
                            mesh.geometry.name = "geometry_Bubbles";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Bubbles"]);
                            mesh.material.name = "material_Bubbles";
                            break;

                        case "brush_CelVinyl":
                            mesh.geometry.name = "geometry_CelVinyl";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["CelVinyl"]);
                            mesh.material.name = "material_CelVinyl";
                            break;

                        case "brush_ChromaticWave":
                            mesh.geometry.name = "geometry_DiamondHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["ChromaticWave"]);
                            mesh.material.name = "material_ChromaticWave";
                            break;

                        case "brush_CoarseBristles":
                            mesh.geometry.name = "geometry_CoarseBristles";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["CoarseBristles"]);
                            mesh.material.name = "material_CoarseBristles";
                            break;

                        case "brush_Comet":
                            mesh.geometry.name = "geometry_Comet";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Comet"]);
                            mesh.material.name = "material_Comet";
                            break;

                        case "brush_DiamondHull":
                            mesh.geometry.name = "geometry_DiamondHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DiamondHull"]);
                            mesh.material.name = "material_DiamondHull";
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_Disco":
                            mesh.geometry.name = "geometry_Disco";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Disco"]);
                            mesh.material.name = "material_Disco";
                            break;

                        case "brush_DotMarker":
                            mesh.geometry.name = "geometry_DotMarker";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DotMarker"]);
                            mesh.material.name = "material_DotMarker";
                            break;

                        case "brush_Dots":
                            mesh.geometry.name = "geometry_Dots";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Dots"]);
                            mesh.material.name = "material_Dots";
                            break;

                        case "brush_DoubleTaperedFlat":
                            mesh.geometry.name = "geometry_DoubleTaperedFlat";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DoubleTaperedFlat"]);
                            mesh.material.name = "material_DoubleTaperedFlat";
                            break;

                        case "brush_DoubleTaperedMarker":
                            mesh.geometry.name = "geometry_DoubleTaperedMarker";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DoubleTaperedMarker"]);
                            mesh.material.name = "material_DoubleTaperedMarker";
                            break;

                        case "brush_DuctTape":
                            mesh.geometry.name = "geometry_DuctTape";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DuctTape"]);
                            mesh.material.name = "material_DuctTape";
                            break;

                        case "brush_Electricity":
                            mesh.geometry.name = "geometry_Electricity";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Electricity"]);
                            mesh.material.name = "material_Electricity";
                            break;

                        case "brush_Embers":
                            mesh.geometry.name = "geometry_Embers";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Embers"]);
                            mesh.material.name = "material_Embers";
                            break;

                        case "brush_EnvironmentDiffuse":
                            mesh.geometry.name = "geometry_EnvironmentDiffuse";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["EnvironmentDiffuse"]);
                            mesh.material.name = "material_EnvironmentDiffuse";
                            break;

                        case "brush_EnvironmentDiffuseLightMap":
                            mesh.geometry.name = "geometry_EnvironmentDiffuseLightMap";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["EnvironmentDiffuseLightMap"]);
                            mesh.material.name = "material_EnvironmentDiffuseLightMap";
                            break;

                        case "brush_Fire":
                            mesh.geometry.name = "geometry_Fire";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Fire"]);
                            mesh.material.name = "material_Fire";
                            break;

                        case "brush_Flat":
                            mesh.geometry.name = "geometry_Flat";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Flat"]);
                            mesh.material.name = "material_Flat";
                            break;

                        case "brush_FlatDeprecated":
                            mesh.geometry.name = "geometry_FlatDeprecated";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["FlatDeprecated"]);
                            mesh.material.name = "material_FlatDeprecated";
                            break;

                        case "brush_Highlighter":
                            mesh.geometry.name = "geometry_Highlighter";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Highlighter"]);
                            mesh.material.name = "material_Highlighter";
                            break;

                        case "brush_Hypercolor":
                            mesh.geometry.name = "geometry_Hypercolor";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Hypercolor"]);
                            mesh.material.name = "material_Hypercolor";
                            break;

                        case "brush_HyperGrid":
                            mesh.geometry.name = "geometry_HyperGrid";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["HyperGrid"]);
                            mesh.material.name = "material_HyperGrid";
                            break;

                        case "brush_Icing":
                            mesh.geometry.name = "geometry_Icing";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));

                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Icing"]);
                            mesh.material.name = "material_Icing";
                            break;

                        case "brush_Ink":
                            mesh.geometry.name = "geometry_Ink";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Ink"]);
                            mesh.material.name = "material_Ink";
                            break;

                        case "brush_Leaves":
                            mesh.geometry.name = "geometry_Leaves";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Leaves"]);
                            mesh.material.name = "material_Leaves";
                            break;

                        case "brush_Light":
                            mesh.geometry.name = "geometry_Light";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Light"]);
                            mesh.material.name = "material_Light";
                            break;

                        case "brush_LightWire":
                            mesh.geometry.name = "geometry_DiamondHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DiamondHull"]);
                            mesh.material.name = "material_DiamondHull";
                            break;

                        case "brush_Lofted":
                            mesh.geometry.name = "geometry_Lofted";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Lofted"]);
                            mesh.material.name = "material_Lofted";
                            break;

                        case "brush_Marker":
                            mesh.geometry.name = "geometry_Marker";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Marker"]);
                            mesh.material.name = "material_Marker";
                            break;

                        case "brush_MatteHull":
                            mesh.geometry.name = "geometry_MatteHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["MatteHull"]);
                            mesh.material.name = "material_MatteHull";
                            break;

                        case "brush_NeonPulse":
                            mesh.geometry.name = "geometry_NeonPulse";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["NeonPulse"]);
                            mesh.material.name = "material_NeonPulse";
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_OilPaint":
                            mesh.geometry.name = "geometry_OilPaint";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));

                            mesh.material = new RawShaderMaterial(TiltBrushShaders["OilPaint"]);
                            mesh.material.name = "material_OilPaint";
                            break;

                        case "brush_Paper":
                            mesh.geometry.name = "geometry_Paper";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Paper"]);
                            mesh.material.name = "material_Paper";
                            break;

                        case "brush_PbrTemplate":
                            mesh.geometry.name = "geometry_PbrTemplate";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["PbrTemplate"]);
                            mesh.material.name = "material_PbrTemplate";
                            break;

                        case "brush_PbrTransparentTemplate":
                            mesh.geometry.name = "geometry_PbrTransparentTemplate";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["PbrTransparentTemplate"]);
                            mesh.material.name = "material_PbrTransparentTemplate";
                            break;

                        case "brush_Petal":
                            mesh.geometry.name = "geometry_Petal";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Petal"]);
                            mesh.material.name = "material_Petal";
                            break;

                        case "brush_Plasma":
                            mesh.geometry.name = "geometry_Plasma";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Plasma"]);
                            mesh.material.name = "material_Plasma";
                            break;

                        case "brush_Rainbow":
                            mesh.geometry.name = "geometry_Rainbow";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));

                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Rainbow"]);
                            mesh.material.name = "material_Rainbow";
                            this.updateableMeshes.push(mesh);
                            break;

                        case "brush_ShinyHull":
                            mesh.geometry.name = "geometry_ShinyHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["ShinyHull"]);
                            mesh.material.name = "material_ShinyHull";
                            break;

                        case "brush_Smoke":
                            mesh.geometry.name = "geometry_Smoke";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("position")); //in theory this should be "_tb_unity_normal" but I can't see anything with that.
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Smoke"]);
                            mesh.material.name = "material_Smoke";
                            break;

                        case "brush_Snow":
                            mesh.geometry.name = "geometry_Snow";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Snow"]);
                            mesh.material.name = "material_Snow";
                            break;

                        case "brush_SoftHighlighter":
                            mesh.geometry.name = "geometry_SoftHighlighter";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["SoftHighlighter"]);
                            mesh.material.name = "material_SoftHighlighter";
                            break;

                        case "brush_Spikes":
                            mesh.geometry.name = "geometry_Spikes";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Spikes"]);
                            mesh.material.name = "material_Spikes";
                            break;

                        case "brush_Splatter":
                            mesh.geometry.name = "geometry_Splatter";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Splatter"]);
                            mesh.material.name = "material_Splatter";
                            break;

                        case "brush_Stars":
                            mesh.geometry.name = "geometry_Stars";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Stars"]);
                            mesh.material.name = "material_Stars";
                            break;

                        case "brush_Streamers":
                            mesh.geometry.name = "geometry_Streamers";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Streamers"]);
                            mesh.material.name = "material_Streamers";
                            break;

                        case "brush_Taffy":
                            mesh.geometry.name = "geometry_DiamondHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DiamondHull"]);
                            mesh.material.name = "material_DiamondHull";
                            break;

                        case "brush_TaperedFlat":
                            mesh.geometry.name = "geometry_TaperedFlat";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["TaperedFlat"]);
                            mesh.material.name = "material_TaperedFlat";
                            break;

                        case "brush_TaperedMarker":
                            mesh.geometry.name = "geometry_TaperedMarker";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["TaperedMarker"]);
                            mesh.material.name = "material_TaperedMarker";
                            break;

                        case "brush_TaperedMarker_Flat":
                            mesh.geometry.name = "geometry_Flat";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Flat"]);
                            mesh.material.name = "material_Flat";
                            break;

                        case "brush_ThickPaint":
                            mesh.geometry.name = "geometry_ThickPaint";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["ThickPaint"]);
                            mesh.material.name = "material_ThickPaint";
                            break;

                        case "brush_Toon":
                            mesh.geometry.name = "geometry_Toon";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Toon"]);
                            mesh.material.name = "material_Toon";
                            break;

                        case "brush_UnlitHull":
                            mesh.geometry.name = "geometry_UnlitHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["UnlitHull"]);
                            mesh.material.name = "material_UnlitHull";
                            break;

                        case "brush_VelvetInk":
                            mesh.geometry.name = "geometry_VelvetInk";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["VelvetInk"]);
                            mesh.material.name = "material_VelvetInk";
                            break;

                        case "brush_Waveform":
                            mesh.geometry.name = "geometry_Waveform";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Waveform"]);
                            mesh.material.name = "material_Waveform";
                            break;

                        case "brush_WetPaint":
                            mesh.geometry.name = "geometry_WetPaint";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["WetPaint"]);
                            mesh.material.name = "material_WetPaint";
                            break;

                        case "brush_WigglyGraphite":
                            mesh.geometry.name = "geometry_WigglyGraphite";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["WigglyGraphite"]);
                            mesh.material.name = "material_WigglyGraphite";
                            break;

                        case "brush_Wire":
                            mesh.geometry.name = "geometry_Wire";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Wire"]);
                            mesh.material.name = "material_Wire";
                            break;

                        default:
                            mesh.material = new MeshStandardMaterial( { visible: false } );
                    }
                }
            });
            this.scene.clear();
            this.scene.add(this.loadedModel);

            //Setup camera to center model
            const box = new Box3().setFromObject(this.loadedModel);
            const boxSize = box.getSize(new Vector3()).length();
            const boxCenter = box.getCenter(new Vector3());

            this.cameraControls.minDistance = boxSize * 0.01;
            this.cameraControls.maxDistance = boxSize;

            const midDistance = this.cameraControls.minDistance + (this.cameraControls.maxDistance - this.cameraControls.minDistance) / 2;
            this.cameraControls.setTarget(boxCenter.x, boxCenter.y, boxCenter.z);
            this.cameraControls.dollyTo(midDistance, true);
            this.cameraControls.saveState();

            //DEBUG LIGHTING
            var keyLightNode = new DirectionalLight(0xFFEEDD, 0.325);
            keyLightNode.position.set(-19.021, 34.882, -19.134);
            keyLightNode.scale.set(0, 0, 16.828);
            this.scene.add(keyLightNode);

            var headLightNode = new DirectionalLight(0xFFEEDD, 0.250);
            headLightNode.position.set(-16.661, 8.330, 8.330);
            headLightNode.scale.set(1, 1, 1);
            this.scene.add(headLightNode);

            var __hemi__ = new HemisphereLight(0xEFEFFF, 0xB2B2B2, 0);
            __hemi__.position.set(0, 1, 0);
            this.scene.add(__hemi__);

            this.loaded = true;
        });
    }

    public loadPoly(assetID : string) {
        const http = new XMLHttpRequest();
        const url = `https://api.icosa.gallery/poly/assets/${assetID}`;

        const that = this;
        http.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const polyAsset = Convert.toPoly(this.response);

                //To dict, for format preference sorting
                let types: { [name: string]: JSONPolyFormat } = {}; 
                polyAsset.formats.forEach(format => {
                    types[format.formatType] = format;
                    
                });

                if(types.hasOwnProperty("GLTF")) {
                    that.initPolyGltf(types.GLTF.root.url);
                    return;
                }

                if(types.hasOwnProperty("TILT")) {
                    that.initTilt(types.TILT.root.url);
                    return;
                }
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
        this.tiltLoader.load(url, (tilt) => {
            this.scene.clear();
            this.scene.add(tilt);
        });
    }

    private initPolyGltf(url : string) {
        this.legacygltf.load(url, (gltf) => {
            this.scene.clear();
            this.scene.add(gltf.scene);
        });
    }
}