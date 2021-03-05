/*!
 * Icosa Viewer
 * https://github.com/icosa-gallery/icosa-viewer
 * Copyright (c) 2021 Icosa Gallery
 * Released under the Apache 2.0 Licence.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three'), require('three/examples/jsm/webxr/VRButton'), require('camera-controls'), require('hold-event'), require('three/examples/jsm/loaders/TiltLoader')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three', 'three/examples/jsm/webxr/VRButton', 'camera-controls', 'hold-event', 'three/examples/jsm/loaders/TiltLoader'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.IcosaViewer = {}, global.THREE, global.VRButton, global.CameraControls, global.holdEvent, global.TiltLoader));
}(this, (function (exports, THREE, VRButton, CameraControls, holdEvent, TiltLoader) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(function (k) {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () {
							return e[k];
						}
					});
				}
			});
		}
		n['default'] = e;
		return Object.freeze(n);
	}

	var THREE__namespace = /*#__PURE__*/_interopNamespace(THREE);
	var CameraControls__default = /*#__PURE__*/_interopDefaultLegacy(CameraControls);

	function styleInject(css, ref) {
	  if ( ref === void 0 ) ref = {};
	  var insertAt = ref.insertAt;

	  if (!css || typeof document === 'undefined') { return; }

	  var head = document.head || document.getElementsByTagName('head')[0];
	  var style = document.createElement('style');
	  style.type = 'text/css';

	  if (insertAt === 'top') {
	    if (head.firstChild) {
	      head.insertBefore(style, head.firstChild);
	    } else {
	      head.appendChild(style);
	    }
	  } else {
	    head.appendChild(style);
	  }

	  if (style.styleSheet) {
	    style.styleSheet.cssText = css;
	  } else {
	    style.appendChild(document.createTextNode(css));
	  }
	}

	var css_248z = "#icosa-viewer {\n  margin: 0;\n  width: 100%;\n  height: 100%;\n  position: relative;\n  overflow: hidden;\n  display: block; }\n\n#c {\n  width: 100%;\n  height: 100%;\n  display: block;\n  position: static; }\n";
	styleInject(css_248z);

	var Convert = (function () {
	    function Convert() {
	    }
	    Convert.toPoly = function (json) {
	        return JSON.parse(json);
	    };
	    Convert.polyToJson = function (value) {
	        return JSON.stringify(value);
	    };
	    return Convert;
	}());

	var Loader = (function () {
	    function Loader(scene, camercontrols) {
	        this.tiltLoader = new TiltLoader.TiltLoader();
	        this.scene = scene;
	    }
	    Loader.prototype.load = function (assetID) {
	    };
	    Loader.prototype.loadPoly = function (assetID) {
	        var http = new XMLHttpRequest();
	        var url = "https://api.icosa.gallery/poly/assets/" + assetID;
	        var that = this;
	        http.onreadystatechange = function () {
	            if (this.readyState == 4 && this.status == 200) {
	                var polyAsset = Convert.toPoly(this.response);
	                polyAsset.formats.forEach(function (format) {
	                    if (format.formatType === "TILT") {
	                        that.initTilt(format.root.url);
	                        return;
	                    }
	                });
	            }
	        };
	        http.open("GET", url, true);
	        http.send();
	    };
	    Loader.prototype.loadPolyURL = function (url) {
	        var splitURL = url.split('/');
	        if (splitURL[2] === "poly.google.com")
	            this.loadPoly(splitURL[4]);
	    };
	    Loader.prototype.initTilt = function (url) {
	        var _this = this;
	        this.scene.clear();
	        this.tiltLoader.load(url, function (tilt) {
	            _this.scene.add(tilt);
	        });
	    };
	    return Loader;
	}());

	var Viewer = (function () {
	    function Viewer(frame) {
	        this.icosa_frame = frame;
	        this.initViewer();
	    }
	    Viewer.prototype.setupNavigation = function (cameraControls) {
	        var KEYCODE = {
	            W: 87,
	            A: 65,
	            S: 83,
	            D: 68,
	            Q: 81,
	            E: 69,
	            ARROW_LEFT: 37,
	            ARROW_UP: 38,
	            ARROW_RIGHT: 39,
	            ARROW_DOWN: 40,
	        };
	        var wKey = new holdEvent.KeyboardKeyHold(KEYCODE.W, 1);
	        var aKey = new holdEvent.KeyboardKeyHold(KEYCODE.A, 1);
	        var sKey = new holdEvent.KeyboardKeyHold(KEYCODE.S, 1);
	        var dKey = new holdEvent.KeyboardKeyHold(KEYCODE.D, 1);
	        var qKey = new holdEvent.KeyboardKeyHold(KEYCODE.Q, 1);
	        var eKey = new holdEvent.KeyboardKeyHold(KEYCODE.E, 1);
	        aKey.addEventListener('holding', function (event) { cameraControls.truck(-0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), 0, true); });
	        dKey.addEventListener('holding', function (event) { cameraControls.truck(0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), 0, true); });
	        wKey.addEventListener('holding', function (event) { cameraControls.forward(0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
	        sKey.addEventListener('holding', function (event) { cameraControls.forward(-0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
	        qKey.addEventListener('holding', function (event) { cameraControls.truck(0, 0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
	        eKey.addEventListener('holding', function (event) { cameraControls.truck(0, -0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
	        var leftKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_LEFT, 1);
	        var rightKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_RIGHT, 1);
	        var upKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_UP, 1);
	        var downKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_DOWN, 1);
	        leftKey.addEventListener('holding', function (event) { cameraControls.rotate(0.1 * THREE.MathUtils.DEG2RAD * (event === null || event === void 0 ? void 0 : event.deltaTime), 0, true); });
	        rightKey.addEventListener('holding', function (event) { cameraControls.rotate(-0.1 * THREE.MathUtils.DEG2RAD * (event === null || event === void 0 ? void 0 : event.deltaTime), 0, true); });
	        upKey.addEventListener('holding', function (event) { cameraControls.rotate(0, -0.05 * THREE.MathUtils.DEG2RAD * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
	        downKey.addEventListener('holding', function (event) { cameraControls.rotate(0, 0.05 * THREE.MathUtils.DEG2RAD * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
	    };
	    Viewer.prototype.initViewer = function () {
	        if (!this.icosa_frame)
	            this.icosa_frame = document.getElementById('icosa-viewer');
	        if (!this.icosa_frame) {
	            this.icosa_frame = document.createElement('div');
	            this.icosa_frame.id = 'icosa-viewer';
	        }
	        var canvas = document.createElement('canvas');
	        canvas.id = 'c';
	        this.icosa_frame.appendChild(canvas);
	        var renderer = new THREE.WebGLRenderer({ canvas: canvas });
	        renderer.setPixelRatio(window.devicePixelRatio);
	        renderer.xr.enabled = true;
	        document.body.appendChild(VRButton.VRButton.createButton(renderer));
	        CameraControls__default['default'].install({ THREE: THREE__namespace });
	        var clock = new THREE.Clock();
	        var fov = 75;
	        var aspect = 2;
	        var near = 0.1;
	        var far = 1000;
	        var flatCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	        flatCamera.position.set(10, 10, 10);
	        var cameraControls = new CameraControls__default['default'](flatCamera, canvas);
	        cameraControls.dampingFactor = 0.1;
	        cameraControls.polarRotateSpeed = cameraControls.azimuthRotateSpeed = 0.5;
	        cameraControls.setTarget(0, 0, 0);
	        cameraControls.dollyTo(3, true);
	        flatCamera.updateProjectionMatrix();
	        var xrCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	        xrCamera.updateProjectionMatrix();
	        this.setupNavigation(cameraControls);
	        var scene = new THREE.Scene();
	        scene.background = new THREE.Color(0xFFE5B4);
	        var light = new THREE.DirectionalLight();
	        light.intensity = 2.0;
	        scene.add(light);
	        this.icosa_viewer = new Loader(scene, cameraControls);
	        function animate() {
	            renderer.setAnimationLoop(render);
	        }
	        function render() {
	            var updated = false;
	            var delta = clock.getDelta();
	            clock.getElapsedTime();
	            updated = cameraControls.update(delta) || renderer.xr.isPresenting;
	            var needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;
	            if (needResize) {
	                renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
	                flatCamera.aspect = canvas.clientWidth / canvas.clientHeight;
	                flatCamera.updateProjectionMatrix();
	                updated = true;
	            }
	            if (updated) {
	                if (renderer.xr.isPresenting) {
	                    renderer.render(scene, xrCamera);
	                }
	                else {
	                    renderer.render(scene, flatCamera);
	                }
	            }
	        }
	        animate();
	    };
	    Viewer.prototype.load = function (url) {
	        var _a;
	        (_a = this.icosa_viewer) === null || _a === void 0 ? void 0 : _a.loadPoly(url);
	    };
	    return Viewer;
	}());

	exports.Convert = Convert;
	exports.Loader = Loader;
	exports.Viewer = Viewer;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
