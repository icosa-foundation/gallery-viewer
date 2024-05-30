/*!
 * camera-controls
 * https://github.com/yomotsu/camera-controls
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */
var ACTION;
(function (ACTION) {
    ACTION[ACTION["NONE"] = 0] = "NONE";
    ACTION[ACTION["ROTATE"] = 1] = "ROTATE";
    ACTION[ACTION["TRUCK"] = 2] = "TRUCK";
    ACTION[ACTION["OFFSET"] = 3] = "OFFSET";
    ACTION[ACTION["DOLLY"] = 4] = "DOLLY";
    ACTION[ACTION["ZOOM"] = 5] = "ZOOM";
    ACTION[ACTION["TOUCH_ROTATE"] = 6] = "TOUCH_ROTATE";
    ACTION[ACTION["TOUCH_TRUCK"] = 7] = "TOUCH_TRUCK";
    ACTION[ACTION["TOUCH_OFFSET"] = 8] = "TOUCH_OFFSET";
    ACTION[ACTION["TOUCH_DOLLY"] = 9] = "TOUCH_DOLLY";
    ACTION[ACTION["TOUCH_ZOOM"] = 10] = "TOUCH_ZOOM";
    ACTION[ACTION["TOUCH_DOLLY_TRUCK"] = 11] = "TOUCH_DOLLY_TRUCK";
    ACTION[ACTION["TOUCH_DOLLY_OFFSET"] = 12] = "TOUCH_DOLLY_OFFSET";
    ACTION[ACTION["TOUCH_ZOOM_TRUCK"] = 13] = "TOUCH_ZOOM_TRUCK";
    ACTION[ACTION["TOUCH_ZOOM_OFFSET"] = 14] = "TOUCH_ZOOM_OFFSET";
})(ACTION || (ACTION = {}));
function isPerspectiveCamera(camera) {
    return camera.isPerspectiveCamera;
}
function isOrthographicCamera(camera) {
    return camera.isOrthographicCamera;
}

const PI_2 = Math.PI * 2;
const PI_HALF = Math.PI / 2;

const EPSILON = 1e-5;
function approxZero(number, error = EPSILON) {
    return Math.abs(number) < error;
}
function approxEquals(a, b, error = EPSILON) {
    return approxZero(a - b, error);
}
function roundToStep(value, step) {
    return Math.round(value / step) * step;
}
function infinityToMaxNumber(value) {
    if (isFinite(value))
        return value;
    if (value < 0)
        return -Number.MAX_VALUE;
    return Number.MAX_VALUE;
}
function maxNumberToInfinity(value) {
    if (Math.abs(value) < Number.MAX_VALUE)
        return value;
    return value * Infinity;
}

function extractClientCoordFromEvent(pointers, out) {
    out.set(0, 0);
    pointers.forEach((pointer) => {
        out.x += pointer.clientX;
        out.y += pointer.clientY;
    });
    out.x /= pointers.length;
    out.y /= pointers.length;
}

function notSupportedInOrthographicCamera(camera, message) {
    if (isOrthographicCamera(camera)) {
        console.warn(`${message} is not supported in OrthographicCamera`);
        return true;
    }
    return false;
}

function quatInvertCompat(target) {
    if (target.invert) {
        target.invert();
    }
    else {
        target.inverse();
    }
    return target;
}

class EventDispatcher {
    constructor() {
        this._listeners = {};
    }
    addEventListener(type, listener) {
        const listeners = this._listeners;
        if (listeners[type] === undefined)
            listeners[type] = [];
        if (listeners[type].indexOf(listener) === -1)
            listeners[type].push(listener);
    }
    removeEventListener(type, listener) {
        const listeners = this._listeners;
        const listenerArray = listeners[type];
        if (listenerArray !== undefined) {
            const index = listenerArray.indexOf(listener);
            if (index !== -1)
                listenerArray.splice(index, 1);
        }
    }
    removeAllEventListeners(type) {
        if (!type) {
            this._listeners = {};
            return;
        }
        if (Array.isArray(this._listeners[type]))
            this._listeners[type].length = 0;
    }
    dispatchEvent(event) {
        const listeners = this._listeners;
        const listenerArray = listeners[event.type];
        if (listenerArray !== undefined) {
            event.target = this;
            const array = listenerArray.slice(0);
            for (let i = 0, l = array.length; i < l; i++) {
                array[i].call(this, event);
            }
        }
    }
}

const isBrowser = typeof window !== 'undefined';
const isMac = isBrowser && /Mac/.test(navigator.platform);
const isPointerEventsNotSupported = !(isBrowser && 'PointerEvent' in window);
const readonlyACTION = Object.freeze(ACTION);
const TOUCH_DOLLY_FACTOR = 1 / 8;
let THREE;
let _ORIGIN;
let _AXIS_Y;
let _AXIS_Z;
let _v2;
let _v3A;
let _v3B;
let _v3C;
let _xColumn;
let _yColumn;
let _zColumn;
let _sphericalA;
let _sphericalB;
let _box3A;
let _box3B;
let _sphere;
let _quaternionA;
let _quaternionB;
let _rotationMatrix;
let _raycaster;
class CameraControls extends EventDispatcher {
    constructor(camera, domElement) {
        super();
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.minAzimuthAngle = -Infinity;
        this.maxAzimuthAngle = Infinity;
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.infinityDolly = false;
        this.minZoom = 0.01;
        this.maxZoom = Infinity;
        this.dampingFactor = 0.05;
        this.draggingDampingFactor = 0.25;
        this.azimuthRotateSpeed = 1.0;
        this.polarRotateSpeed = 1.0;
        this.dollySpeed = 1.0;
        this.truckSpeed = 2.0;
        this.dollyToCursor = false;
        this.dragToOffset = false;
        this.verticalDragToForward = false;
        this.boundaryFriction = 0.0;
        this.restThreshold = 0.01;
        this.colliderMeshes = [];
        this.cancel = () => { };
        this._enabled = true;
        this._state = ACTION.NONE;
        this._viewport = null;
        this._dollyControlAmount = 0;
        this._hasRested = true;
        this._boundaryEnclosesCamera = false;
        this._needsUpdate = true;
        this._updatedLastTime = false;
        this._elementRect = new DOMRect();
        this._activePointers = [];
        this._truckInternal = (deltaX, deltaY, dragToOffset) => {
            if (isPerspectiveCamera(this._camera)) {
                const offset = _v3A.copy(this._camera.position).sub(this._target);
                const fov = this._camera.getEffectiveFOV() * THREE.MathUtils.DEG2RAD;
                const targetDistance = offset.length() * Math.tan(fov * 0.5);
                const truckX = (this.truckSpeed * deltaX * targetDistance / this._elementRect.height);
                const pedestalY = (this.truckSpeed * deltaY * targetDistance / this._elementRect.height);
                if (this.verticalDragToForward) {
                    dragToOffset ?
                        this.setFocalOffset(this._focalOffsetEnd.x + truckX, this._focalOffsetEnd.y, this._focalOffsetEnd.z, true) :
                        this.truck(truckX, 0, true);
                    this.forward(-pedestalY, true);
                }
                else {
                    dragToOffset ?
                        this.setFocalOffset(this._focalOffsetEnd.x + truckX, this._focalOffsetEnd.y + pedestalY, this._focalOffsetEnd.z, true) :
                        this.truck(truckX, pedestalY, true);
                }
            }
            else if (isOrthographicCamera(this._camera)) {
                const camera = this._camera;
                const truckX = deltaX * (camera.right - camera.left) / camera.zoom / this._elementRect.width;
                const pedestalY = deltaY * (camera.top - camera.bottom) / camera.zoom / this._elementRect.height;
                dragToOffset ?
                    this.setFocalOffset(this._focalOffsetEnd.x + truckX, this._focalOffsetEnd.y + pedestalY, this._focalOffsetEnd.z, true) :
                    this.truck(truckX, pedestalY, true);
            }
        };
        this._rotateInternal = (deltaX, deltaY) => {
            const theta = PI_2 * this.azimuthRotateSpeed * deltaX / this._elementRect.height;
            const phi = PI_2 * this.polarRotateSpeed * deltaY / this._elementRect.height;
            this.rotate(theta, phi, true);
        };
        this._dollyInternal = (delta, x, y) => {
            const dollyScale = Math.pow(0.95, -delta * this.dollySpeed);
            const distance = this._sphericalEnd.radius * dollyScale;
            const prevRadius = this._sphericalEnd.radius;
            const signedPrevRadius = prevRadius * (delta >= 0 ? -1 : 1);
            this.dollyTo(distance);
            if (this.infinityDolly && (distance < this.minDistance || this.maxDistance === this.minDistance)) {
                this._camera.getWorldDirection(_v3A);
                this._targetEnd.add(_v3A.normalize().multiplyScalar(signedPrevRadius));
                this._target.add(_v3A.normalize().multiplyScalar(signedPrevRadius));
            }
            if (this.dollyToCursor) {
                this._dollyControlAmount += this._sphericalEnd.radius - prevRadius;
                if (this.infinityDolly && (distance < this.minDistance || this.maxDistance === this.minDistance)) {
                    this._dollyControlAmount -= signedPrevRadius;
                }
                this._dollyControlCoord.set(x, y);
            }
            return;
        };
        this._zoomInternal = (delta, x, y) => {
            const zoomScale = Math.pow(0.95, delta * this.dollySpeed);
            this.zoomTo(this._zoom * zoomScale);
            if (this.dollyToCursor) {
                this._dollyControlAmount = this._zoomEnd;
                this._dollyControlCoord.set(x, y);
            }
            return;
        };
        if (typeof THREE === 'undefined') {
            console.error('camera-controls: `THREE` is undefined. You must first run `CameraControls.install( { THREE: THREE } )`. Check the docs for further information.');
        }
        this._camera = camera;
        this._yAxisUpSpace = new THREE.Quaternion().setFromUnitVectors(this._camera.up, _AXIS_Y);
        this._yAxisUpSpaceInverse = quatInvertCompat(this._yAxisUpSpace.clone());
        this._state = ACTION.NONE;
        this._domElement = domElement;
        this._domElement.style.touchAction = 'none';
        this._domElement.style.userSelect = 'none';
        this._domElement.style.webkitUserSelect = 'none';
        this._target = new THREE.Vector3();
        this._targetEnd = this._target.clone();
        this._focalOffset = new THREE.Vector3();
        this._focalOffsetEnd = this._focalOffset.clone();
        this._spherical = new THREE.Spherical().setFromVector3(_v3A.copy(this._camera.position).applyQuaternion(this._yAxisUpSpace));
        this._sphericalEnd = this._spherical.clone();
        this._zoom = this._camera.zoom;
        this._zoomEnd = this._zoom;
        this._nearPlaneCorners = [
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
        ];
        this._updateNearPlaneCorners();
        this._boundary = new THREE.Box3(new THREE.Vector3(-Infinity, -Infinity, -Infinity), new THREE.Vector3(Infinity, Infinity, Infinity));
        this._target0 = this._target.clone();
        this._position0 = this._camera.position.clone();
        this._zoom0 = this._zoom;
        this._focalOffset0 = this._focalOffset.clone();
        this._dollyControlAmount = 0;
        this._dollyControlCoord = new THREE.Vector2();
        this.mouseButtons = {
            left: ACTION.ROTATE,
            middle: ACTION.DOLLY,
            right: ACTION.TRUCK,
            wheel: isPerspectiveCamera(this._camera) ? ACTION.DOLLY :
                isOrthographicCamera(this._camera) ? ACTION.ZOOM :
                    ACTION.NONE,
            shiftLeft: ACTION.NONE,
        };
        this.touches = {
            one: ACTION.TOUCH_ROTATE,
            two: isPerspectiveCamera(this._camera) ? ACTION.TOUCH_DOLLY_TRUCK :
                isOrthographicCamera(this._camera) ? ACTION.TOUCH_ZOOM_TRUCK :
                    ACTION.NONE,
            three: ACTION.TOUCH_TRUCK,
        };
        if (this._domElement) {
            const dragStartPosition = new THREE.Vector2();
            const lastDragPosition = new THREE.Vector2();
            const dollyStart = new THREE.Vector2();
            const onPointerDown = (event) => {
                if (!this._enabled)
                    return;
                const pointer = {
                    pointerId: event.pointerId,
                    clientX: event.clientX,
                    clientY: event.clientY,
                };
                this._activePointers.push(pointer);
                switch (event.button) {
                    case THREE.MOUSE.LEFT:
                        this._state = event.shiftKey ? this.mouseButtons.shiftLeft : this.mouseButtons.left;
                        break;
                    case THREE.MOUSE.MIDDLE:
                        this._state = this.mouseButtons.middle;
                        break;
                    case THREE.MOUSE.RIGHT:
                        this._state = this.mouseButtons.right;
                        break;
                }
                if (event.pointerType === 'touch') {
                    switch (this._activePointers.length) {
                        case 1:
                            this._state = this.touches.one;
                            break;
                        case 2:
                            this._state = this.touches.two;
                            break;
                        case 3:
                            this._state = this.touches.three;
                            break;
                    }
                }
                this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, { passive: false });
                this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
                this._domElement.ownerDocument.addEventListener('pointermove', onPointerMove, { passive: false });
                this._domElement.ownerDocument.addEventListener('pointerup', onPointerUp);
                startDragging();
            };
            const onMouseDown = (event) => {
                if (!this._enabled)
                    return;
                const pointer = {
                    pointerId: 0,
                    clientX: event.clientX,
                    clientY: event.clientY,
                };
                this._activePointers.push(pointer);
                switch (event.button) {
                    case THREE.MOUSE.LEFT:
                        this._state = event.shiftKey ? this.mouseButtons.shiftLeft : this.mouseButtons.left;
                        break;
                    case THREE.MOUSE.MIDDLE:
                        this._state = this.mouseButtons.middle;
                        break;
                    case THREE.MOUSE.RIGHT:
                        this._state = this.mouseButtons.right;
                        break;
                }
                this._domElement.ownerDocument.removeEventListener('mousemove', onMouseMove);
                this._domElement.ownerDocument.removeEventListener('mouseup', onMouseUp);
                this._domElement.ownerDocument.addEventListener('mousemove', onMouseMove);
                this._domElement.ownerDocument.addEventListener('mouseup', onMouseUp);
                startDragging();
            };
            const onTouchStart = (event) => {
                if (!this._enabled)
                    return;
                event.preventDefault();
                Array.prototype.forEach.call(event.changedTouches, (touch) => {
                    const pointer = {
                        pointerId: touch.identifier,
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                    };
                    this._activePointers.push(pointer);
                });
                switch (this._activePointers.length) {
                    case 1:
                        this._state = this.touches.one;
                        break;
                    case 2:
                        this._state = this.touches.two;
                        break;
                    case 3:
                        this._state = this.touches.three;
                        break;
                }
                this._domElement.ownerDocument.removeEventListener('touchmove', onTouchMove, { passive: false });
                this._domElement.ownerDocument.removeEventListener('touchend', onTouchEnd);
                this._domElement.ownerDocument.addEventListener('touchmove', onTouchMove, { passive: false });
                this._domElement.ownerDocument.addEventListener('touchend', onTouchEnd);
                startDragging();
            };
            const onPointerMove = (event) => {
                if (event.cancelable)
                    event.preventDefault();
                const pointerId = event.pointerId;
                const pointer = this._findPointerById(pointerId);
                if (!pointer)
                    return;
                pointer.clientX = event.clientX;
                pointer.clientY = event.clientY;
                dragging();
            };
            const onMouseMove = (event) => {
                const pointer = this._findPointerById(0);
                if (!pointer)
                    return;
                pointer.clientX = event.clientX;
                pointer.clientY = event.clientY;
                dragging();
            };
            const onTouchMove = (event) => {
                if (event.cancelable)
                    event.preventDefault();
                Array.prototype.forEach.call(event.changedTouches, (touch) => {
                    const pointerId = touch.identifier;
                    const pointer = this._findPointerById(pointerId);
                    if (!pointer)
                        return;
                    pointer.clientX = touch.clientX;
                    pointer.clientY = touch.clientY;
                });
                dragging();
            };
            const onPointerUp = (event) => {
                const pointerId = event.pointerId;
                const pointer = this._findPointerById(pointerId);
                pointer && this._activePointers.splice(this._activePointers.indexOf(pointer), 1);
                if (event.pointerType === 'touch') {
                    switch (this._activePointers.length) {
                        case 0:
                            this._state = ACTION.NONE;
                            break;
                        case 1:
                            this._state = this.touches.one;
                            break;
                        case 2:
                            this._state = this.touches.two;
                            break;
                        case 3:
                            this._state = this.touches.three;
                            break;
                    }
                }
                else {
                    this._state = ACTION.NONE;
                }
                endDragging();
            };
            const onMouseUp = () => {
                const pointer = this._findPointerById(0);
                pointer && this._activePointers.splice(this._activePointers.indexOf(pointer), 1);
                this._state = ACTION.NONE;
                endDragging();
            };
            const onTouchEnd = (event) => {
                Array.prototype.forEach.call(event.changedTouches, (touch) => {
                    const pointerId = touch.identifier;
                    const pointer = this._findPointerById(pointerId);
                    pointer && this._activePointers.splice(this._activePointers.indexOf(pointer), 1);
                });
                switch (this._activePointers.length) {
                    case 0:
                        this._state = ACTION.NONE;
                        break;
                    case 1:
                        this._state = this.touches.one;
                        break;
                    case 2:
                        this._state = this.touches.two;
                        break;
                    case 3:
                        this._state = this.touches.three;
                        break;
                }
                endDragging();
            };
            let lastScrollTimeStamp = -1;
            const onMouseWheel = (event) => {
                if (!this._enabled || this.mouseButtons.wheel === ACTION.NONE)
                    return;
                event.preventDefault();
                if (this.dollyToCursor ||
                    this.mouseButtons.wheel === ACTION.ROTATE ||
                    this.mouseButtons.wheel === ACTION.TRUCK) {
                    const now = performance.now();
                    if (lastScrollTimeStamp - now < 1000)
                        this._getClientRect(this._elementRect);
                    lastScrollTimeStamp = now;
                }
                const deltaYFactor = isMac ? -1 : -3;
                const delta = (event.deltaMode === 1) ? event.deltaY / deltaYFactor : event.deltaY / (deltaYFactor * 10);
                const x = this.dollyToCursor ? (event.clientX - this._elementRect.x) / this._elementRect.width * 2 - 1 : 0;
                const y = this.dollyToCursor ? (event.clientY - this._elementRect.y) / this._elementRect.height * -2 + 1 : 0;
                switch (this.mouseButtons.wheel) {
                    case ACTION.ROTATE: {
                        this._rotateInternal(event.deltaX, event.deltaY);
                        break;
                    }
                    case ACTION.TRUCK: {
                        this._truckInternal(event.deltaX, event.deltaY, false);
                        break;
                    }
                    case ACTION.OFFSET: {
                        this._truckInternal(event.deltaX, event.deltaY, true);
                        break;
                    }
                    case ACTION.DOLLY: {
                        this._dollyInternal(-delta, x, y);
                        break;
                    }
                    case ACTION.ZOOM: {
                        this._zoomInternal(-delta, x, y);
                        break;
                    }
                }
                this.dispatchEvent({ type: 'control' });
            };
            const onContextMenu = (event) => {
                if (!this._enabled)
                    return;
                event.preventDefault();
            };
            const startDragging = () => {
                if (!this._enabled)
                    return;
                extractClientCoordFromEvent(this._activePointers, _v2);
                this._getClientRect(this._elementRect);
                dragStartPosition.copy(_v2);
                lastDragPosition.copy(_v2);
                const isMultiTouch = this._activePointers.length >= 2;
                if (isMultiTouch) {
                    const dx = _v2.x - this._activePointers[1].clientX;
                    const dy = _v2.y - this._activePointers[1].clientY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    dollyStart.set(0, distance);
                    const x = (this._activePointers[0].clientX + this._activePointers[1].clientX) * 0.5;
                    const y = (this._activePointers[0].clientY + this._activePointers[1].clientY) * 0.5;
                    lastDragPosition.set(x, y);
                }
                this.dispatchEvent({ type: 'controlstart' });
            };
            const dragging = () => {
                if (!this._enabled)
                    return;
                extractClientCoordFromEvent(this._activePointers, _v2);
                const deltaX = lastDragPosition.x - _v2.x;
                const deltaY = lastDragPosition.y - _v2.y;
                lastDragPosition.copy(_v2);
                switch (this._state) {
                    case ACTION.ROTATE:
                    case ACTION.TOUCH_ROTATE: {
                        this._rotateInternal(deltaX, deltaY);
                        break;
                    }
                    case ACTION.DOLLY:
                    case ACTION.ZOOM: {
                        const dollyX = this.dollyToCursor ? (dragStartPosition.x - this._elementRect.x) / this._elementRect.width * 2 - 1 : 0;
                        const dollyY = this.dollyToCursor ? (dragStartPosition.y - this._elementRect.y) / this._elementRect.height * -2 + 1 : 0;
                        this._state === ACTION.DOLLY ?
                            this._dollyInternal(deltaY * TOUCH_DOLLY_FACTOR, dollyX, dollyY) :
                            this._zoomInternal(deltaY * TOUCH_DOLLY_FACTOR, dollyX, dollyY);
                        break;
                    }
                    case ACTION.TOUCH_DOLLY:
                    case ACTION.TOUCH_ZOOM:
                    case ACTION.TOUCH_DOLLY_TRUCK:
                    case ACTION.TOUCH_ZOOM_TRUCK:
                    case ACTION.TOUCH_DOLLY_OFFSET:
                    case ACTION.TOUCH_ZOOM_OFFSET: {
                        const dx = _v2.x - this._activePointers[1].clientX;
                        const dy = _v2.y - this._activePointers[1].clientY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const dollyDelta = dollyStart.y - distance;
                        dollyStart.set(0, distance);
                        const dollyX = this.dollyToCursor ? (lastDragPosition.x - this._elementRect.x) / this._elementRect.width * 2 - 1 : 0;
                        const dollyY = this.dollyToCursor ? (lastDragPosition.y - this._elementRect.y) / this._elementRect.height * -2 + 1 : 0;
                        this._state === ACTION.TOUCH_DOLLY ||
                            this._state === ACTION.TOUCH_DOLLY_TRUCK ||
                            this._state === ACTION.TOUCH_DOLLY_OFFSET ?
                            this._dollyInternal(dollyDelta * TOUCH_DOLLY_FACTOR, dollyX, dollyY) :
                            this._zoomInternal(dollyDelta * TOUCH_DOLLY_FACTOR, dollyX, dollyY);
                        if (this._state === ACTION.TOUCH_DOLLY_TRUCK ||
                            this._state === ACTION.TOUCH_ZOOM_TRUCK) {
                            this._truckInternal(deltaX, deltaY, false);
                        }
                        else if (this._state === ACTION.TOUCH_DOLLY_OFFSET ||
                            this._state === ACTION.TOUCH_ZOOM_OFFSET) {
                            this._truckInternal(deltaX, deltaY, true);
                        }
                        break;
                    }
                    case ACTION.TRUCK:
                    case ACTION.TOUCH_TRUCK: {
                        this._truckInternal(deltaX, deltaY, false);
                        break;
                    }
                    case ACTION.OFFSET:
                    case ACTION.TOUCH_OFFSET: {
                        this._truckInternal(deltaX, deltaY, true);
                        break;
                    }
                }
                this.dispatchEvent({ type: 'control' });
            };
            const endDragging = () => {
                extractClientCoordFromEvent(this._activePointers, _v2);
                lastDragPosition.copy(_v2);
                if (this._activePointers.length === 0) {
                    this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, { passive: false });
                    this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
                    this._domElement.ownerDocument.removeEventListener('touchmove', onTouchMove, { passive: false });
                    this._domElement.ownerDocument.removeEventListener('touchend', onTouchEnd);
                    this.dispatchEvent({ type: 'controlend' });
                }
            };
            this._domElement.addEventListener('pointerdown', onPointerDown);
            isPointerEventsNotSupported && this._domElement.addEventListener('mousedown', onMouseDown);
            isPointerEventsNotSupported && this._domElement.addEventListener('touchstart', onTouchStart);
            this._domElement.addEventListener('pointercancel', onPointerUp);
            this._domElement.addEventListener('wheel', onMouseWheel, { passive: false });
            this._domElement.addEventListener('contextmenu', onContextMenu);
            this._removeAllEventListeners = () => {
                this._domElement.removeEventListener('pointerdown', onPointerDown);
                this._domElement.removeEventListener('mousedown', onMouseDown);
                this._domElement.removeEventListener('touchstart', onTouchStart);
                this._domElement.removeEventListener('pointercancel', onPointerUp);
                this._domElement.removeEventListener('wheel', onMouseWheel, { passive: false });
                this._domElement.removeEventListener('contextmenu', onContextMenu);
                this._domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, { passive: false });
                this._domElement.ownerDocument.removeEventListener('mousemove', onMouseMove);
                this._domElement.ownerDocument.removeEventListener('touchmove', onTouchMove, { passive: false });
                this._domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
                this._domElement.ownerDocument.removeEventListener('mouseup', onMouseUp);
                this._domElement.ownerDocument.removeEventListener('touchend', onTouchEnd);
            };
            this.cancel = () => {
                if (this._state === ACTION.NONE)
                    return;
                this._state = ACTION.NONE;
                this._activePointers.length = 0;
                endDragging();
            };
        }
        this.update(0);
    }
    static install(libs) {
        THREE = libs.THREE;
        _ORIGIN = Object.freeze(new THREE.Vector3(0, 0, 0));
        _AXIS_Y = Object.freeze(new THREE.Vector3(0, 1, 0));
        _AXIS_Z = Object.freeze(new THREE.Vector3(0, 0, 1));
        _v2 = new THREE.Vector2();
        _v3A = new THREE.Vector3();
        _v3B = new THREE.Vector3();
        _v3C = new THREE.Vector3();
        _xColumn = new THREE.Vector3();
        _yColumn = new THREE.Vector3();
        _zColumn = new THREE.Vector3();
        _sphericalA = new THREE.Spherical();
        _sphericalB = new THREE.Spherical();
        _box3A = new THREE.Box3();
        _box3B = new THREE.Box3();
        _sphere = new THREE.Sphere();
        _quaternionA = new THREE.Quaternion();
        _quaternionB = new THREE.Quaternion();
        _rotationMatrix = new THREE.Matrix4();
        _raycaster = new THREE.Raycaster();
    }
    static get ACTION() {
        return readonlyACTION;
    }
    get camera() {
        return this._camera;
    }
    set camera(camera) {
        this._camera = camera;
        this.updateCameraUp();
        this._camera.updateProjectionMatrix();
        this._updateNearPlaneCorners();
        this._needsUpdate = true;
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(enabled) {
        this._enabled = enabled;
        if (enabled) {
            this._domElement.style.touchAction = 'none';
            this._domElement.style.userSelect = 'none';
            this._domElement.style.webkitUserSelect = 'none';
        }
        else {
            this.cancel();
            this._domElement.style.touchAction = '';
            this._domElement.style.userSelect = '';
            this._domElement.style.webkitUserSelect = '';
        }
    }
    get active() {
        return !this._hasRested;
    }
    get currentAction() {
        return this._state;
    }
    get distance() {
        return this._spherical.radius;
    }
    set distance(distance) {
        if (this._spherical.radius === distance &&
            this._sphericalEnd.radius === distance)
            return;
        this._spherical.radius = distance;
        this._sphericalEnd.radius = distance;
        this._needsUpdate = true;
    }
    get azimuthAngle() {
        return this._spherical.theta;
    }
    set azimuthAngle(azimuthAngle) {
        if (this._spherical.theta === azimuthAngle &&
            this._sphericalEnd.theta === azimuthAngle)
            return;
        this._spherical.theta = azimuthAngle;
        this._sphericalEnd.theta = azimuthAngle;
        this._needsUpdate = true;
    }
    get polarAngle() {
        return this._spherical.phi;
    }
    set polarAngle(polarAngle) {
        if (this._spherical.phi === polarAngle &&
            this._sphericalEnd.phi === polarAngle)
            return;
        this._spherical.phi = polarAngle;
        this._sphericalEnd.phi = polarAngle;
        this._needsUpdate = true;
    }
    get boundaryEnclosesCamera() {
        return this._boundaryEnclosesCamera;
    }
    set boundaryEnclosesCamera(boundaryEnclosesCamera) {
        this._boundaryEnclosesCamera = boundaryEnclosesCamera;
        this._needsUpdate = true;
    }
    addEventListener(type, listener) {
        super.addEventListener(type, listener);
    }
    removeEventListener(type, listener) {
        super.removeEventListener(type, listener);
    }
    rotate(azimuthAngle, polarAngle, enableTransition = false) {
        return this.rotateTo(this._sphericalEnd.theta + azimuthAngle, this._sphericalEnd.phi + polarAngle, enableTransition);
    }
    rotateAzimuthTo(azimuthAngle, enableTransition = false) {
        return this.rotateTo(azimuthAngle, this._sphericalEnd.phi, enableTransition);
    }
    rotatePolarTo(polarAngle, enableTransition = false) {
        return this.rotateTo(this._sphericalEnd.theta, polarAngle, enableTransition);
    }
    rotateTo(azimuthAngle, polarAngle, enableTransition = false) {
        const theta = THREE.MathUtils.clamp(azimuthAngle, this.minAzimuthAngle, this.maxAzimuthAngle);
        const phi = THREE.MathUtils.clamp(polarAngle, this.minPolarAngle, this.maxPolarAngle);
        this._sphericalEnd.theta = theta;
        this._sphericalEnd.phi = phi;
        this._sphericalEnd.makeSafe();
        this._needsUpdate = true;
        if (!enableTransition) {
            this._spherical.theta = this._sphericalEnd.theta;
            this._spherical.phi = this._sphericalEnd.phi;
        }
        const resolveImmediately = !enableTransition ||
            approxEquals(this._spherical.theta, this._sphericalEnd.theta, this.restThreshold) &&
                approxEquals(this._spherical.phi, this._sphericalEnd.phi, this.restThreshold);
        return this._createOnRestPromise(resolveImmediately);
    }
    dolly(distance, enableTransition = false) {
        return this.dollyTo(this._sphericalEnd.radius - distance, enableTransition);
    }
    dollyTo(distance, enableTransition = false) {
        const lastRadius = this._sphericalEnd.radius;
        const newRadius = THREE.MathUtils.clamp(distance, this.minDistance, this.maxDistance);
        const hasCollider = this.colliderMeshes.length >= 1;
        if (hasCollider) {
            const maxDistanceByCollisionTest = this._collisionTest();
            const isCollided = approxEquals(maxDistanceByCollisionTest, this._spherical.radius);
            const isDollyIn = lastRadius > newRadius;
            if (!isDollyIn && isCollided)
                return Promise.resolve();
            this._sphericalEnd.radius = Math.min(newRadius, maxDistanceByCollisionTest);
        }
        else {
            this._sphericalEnd.radius = newRadius;
        }
        this._needsUpdate = true;
        if (!enableTransition) {
            this._spherical.radius = this._sphericalEnd.radius;
        }
        const resolveImmediately = !enableTransition || approxEquals(this._spherical.radius, this._sphericalEnd.radius, this.restThreshold);
        return this._createOnRestPromise(resolveImmediately);
    }
    zoom(zoomStep, enableTransition = false) {
        return this.zoomTo(this._zoomEnd + zoomStep, enableTransition);
    }
    zoomTo(zoom, enableTransition = false) {
        this._zoomEnd = THREE.MathUtils.clamp(zoom, this.minZoom, this.maxZoom);
        this._needsUpdate = true;
        if (!enableTransition) {
            this._zoom = this._zoomEnd;
        }
        const resolveImmediately = !enableTransition || approxEquals(this._zoom, this._zoomEnd, this.restThreshold);
        return this._createOnRestPromise(resolveImmediately);
    }
    pan(x, y, enableTransition = false) {
        console.warn('`pan` has been renamed to `truck`');
        return this.truck(x, y, enableTransition);
    }
    truck(x, y, enableTransition = false) {
        this._camera.updateMatrix();
        _xColumn.setFromMatrixColumn(this._camera.matrix, 0);
        _yColumn.setFromMatrixColumn(this._camera.matrix, 1);
        _xColumn.multiplyScalar(x);
        _yColumn.multiplyScalar(-y);
        const offset = _v3A.copy(_xColumn).add(_yColumn);
        const to = _v3B.copy(this._targetEnd).add(offset);
        return this.moveTo(to.x, to.y, to.z, enableTransition);
    }
    forward(distance, enableTransition = false) {
        _v3A.setFromMatrixColumn(this._camera.matrix, 0);
        _v3A.crossVectors(this._camera.up, _v3A);
        _v3A.multiplyScalar(distance);
        const to = _v3B.copy(this._targetEnd).add(_v3A);
        return this.moveTo(to.x, to.y, to.z, enableTransition);
    }
    moveTo(x, y, z, enableTransition = false) {
        const offset = _v3A.set(x, y, z).sub(this._targetEnd);
        this._encloseToBoundary(this._targetEnd, offset, this.boundaryFriction);
        this._needsUpdate = true;
        if (!enableTransition) {
            this._target.copy(this._targetEnd);
        }
        const resolveImmediately = !enableTransition ||
            approxEquals(this._target.x, this._targetEnd.x, this.restThreshold) &&
                approxEquals(this._target.y, this._targetEnd.y, this.restThreshold) &&
                approxEquals(this._target.z, this._targetEnd.z, this.restThreshold);
        return this._createOnRestPromise(resolveImmediately);
    }
    fitToBox(box3OrObject, enableTransition, { paddingLeft = 0, paddingRight = 0, paddingBottom = 0, paddingTop = 0 } = {}) {
        const promises = [];
        const aabb = box3OrObject.isBox3
            ? _box3A.copy(box3OrObject)
            : _box3A.setFromObject(box3OrObject);
        if (aabb.isEmpty()) {
            console.warn('camera-controls: fitTo() cannot be used with an empty box. Aborting');
            Promise.resolve();
        }
        const theta = roundToStep(this._sphericalEnd.theta, PI_HALF);
        const phi = roundToStep(this._sphericalEnd.phi, PI_HALF);
        promises.push(this.rotateTo(theta, phi, enableTransition));
        const normal = _v3A.setFromSpherical(this._sphericalEnd).normalize();
        const rotation = _quaternionA.setFromUnitVectors(normal, _AXIS_Z);
        const viewFromPolar = approxEquals(Math.abs(normal.y), 1);
        if (viewFromPolar) {
            rotation.multiply(_quaternionB.setFromAxisAngle(_AXIS_Y, theta));
        }
        const bb = _box3B.makeEmpty();
        _v3B.copy(aabb.min).applyQuaternion(rotation);
        bb.expandByPoint(_v3B);
        _v3B.copy(aabb.min).setX(aabb.max.x).applyQuaternion(rotation);
        bb.expandByPoint(_v3B);
        _v3B.copy(aabb.min).setY(aabb.max.y).applyQuaternion(rotation);
        bb.expandByPoint(_v3B);
        _v3B.copy(aabb.max).setZ(aabb.min.z).applyQuaternion(rotation);
        bb.expandByPoint(_v3B);
        _v3B.copy(aabb.min).setZ(aabb.max.z).applyQuaternion(rotation);
        bb.expandByPoint(_v3B);
        _v3B.copy(aabb.max).setY(aabb.min.y).applyQuaternion(rotation);
        bb.expandByPoint(_v3B);
        _v3B.copy(aabb.max).setX(aabb.min.x).applyQuaternion(rotation);
        bb.expandByPoint(_v3B);
        _v3B.copy(aabb.max).applyQuaternion(rotation);
        bb.expandByPoint(_v3B);
        rotation.setFromUnitVectors(_AXIS_Z, normal);
        bb.min.x -= paddingLeft;
        bb.min.y -= paddingBottom;
        bb.max.x += paddingRight;
        bb.max.y += paddingTop;
        const bbSize = bb.getSize(_v3A);
        const center = bb.getCenter(_v3B).applyQuaternion(rotation);
        if (isPerspectiveCamera(this._camera)) {
            const distance = this.getDistanceToFitBox(bbSize.x, bbSize.y, bbSize.z);
            promises.push(this.moveTo(center.x, center.y, center.z, enableTransition));
            promises.push(this.dollyTo(distance, enableTransition));
            promises.push(this.setFocalOffset(0, 0, 0, enableTransition));
        }
        else if (isOrthographicCamera(this._camera)) {
            const camera = this._camera;
            const width = camera.right - camera.left;
            const height = camera.top - camera.bottom;
            const zoom = Math.min(width / bbSize.x, height / bbSize.y);
            promises.push(this.moveTo(center.x, center.y, center.z, enableTransition));
            promises.push(this.zoomTo(zoom, enableTransition));
            promises.push(this.setFocalOffset(0, 0, 0, enableTransition));
        }
        return Promise.all(promises);
    }
    fitTo(box3OrObject, enableTransition, fitToOptions = {}) {
        console.warn('camera-controls: fitTo() has been renamed to fitToBox()');
        return this.fitToBox(box3OrObject, enableTransition, fitToOptions);
    }
    fitToSphere(sphereOrMesh, enableTransition) {
        const promises = [];
        const isSphere = sphereOrMesh instanceof THREE.Sphere;
        const boundingSphere = isSphere ?
            _sphere.copy(sphereOrMesh) :
            createBoundingSphere(sphereOrMesh, _sphere);
        promises.push(this.moveTo(boundingSphere.center.x, boundingSphere.center.y, boundingSphere.center.z, enableTransition));
        if (isPerspectiveCamera(this._camera)) {
            const distanceToFit = this.getDistanceToFitSphere(boundingSphere.radius);
            promises.push(this.dollyTo(distanceToFit, enableTransition));
        }
        else if (isOrthographicCamera(this._camera)) {
            const width = this._camera.right - this._camera.left;
            const height = this._camera.top - this._camera.bottom;
            const diameter = 2 * boundingSphere.radius;
            const zoom = Math.min(width / diameter, height / diameter);
            promises.push(this.zoomTo(zoom, enableTransition));
        }
        promises.push(this.setFocalOffset(0, 0, 0, enableTransition));
        return Promise.all(promises);
    }
    setLookAt(positionX, positionY, positionZ, targetX, targetY, targetZ, enableTransition = false) {
        const target = _v3B.set(targetX, targetY, targetZ);
        const position = _v3A.set(positionX, positionY, positionZ);
        this._targetEnd.copy(target);
        this._sphericalEnd.setFromVector3(position.sub(target).applyQuaternion(this._yAxisUpSpace));
        this.normalizeRotations();
        this._needsUpdate = true;
        if (!enableTransition) {
            this._target.copy(this._targetEnd);
            this._spherical.copy(this._sphericalEnd);
        }
        const resolveImmediately = !enableTransition ||
            approxEquals(this._target.x, this._targetEnd.x, this.restThreshold) &&
                approxEquals(this._target.y, this._targetEnd.y, this.restThreshold) &&
                approxEquals(this._target.z, this._targetEnd.z, this.restThreshold) &&
                approxEquals(this._spherical.theta, this._sphericalEnd.theta, this.restThreshold) &&
                approxEquals(this._spherical.phi, this._sphericalEnd.phi, this.restThreshold) &&
                approxEquals(this._spherical.radius, this._sphericalEnd.radius, this.restThreshold);
        return this._createOnRestPromise(resolveImmediately);
    }
    lerpLookAt(positionAX, positionAY, positionAZ, targetAX, targetAY, targetAZ, positionBX, positionBY, positionBZ, targetBX, targetBY, targetBZ, t, enableTransition = false) {
        const targetA = _v3A.set(targetAX, targetAY, targetAZ);
        const positionA = _v3B.set(positionAX, positionAY, positionAZ);
        _sphericalA.setFromVector3(positionA.sub(targetA).applyQuaternion(this._yAxisUpSpace));
        const targetB = _v3C.set(targetBX, targetBY, targetBZ);
        const positionB = _v3B.set(positionBX, positionBY, positionBZ);
        _sphericalB.setFromVector3(positionB.sub(targetB).applyQuaternion(this._yAxisUpSpace));
        this._targetEnd.copy(targetA.lerp(targetB, t));
        const deltaTheta = _sphericalB.theta - _sphericalA.theta;
        const deltaPhi = _sphericalB.phi - _sphericalA.phi;
        const deltaRadius = _sphericalB.radius - _sphericalA.radius;
        this._sphericalEnd.set(_sphericalA.radius + deltaRadius * t, _sphericalA.phi + deltaPhi * t, _sphericalA.theta + deltaTheta * t);
        this.normalizeRotations();
        this._needsUpdate = true;
        if (!enableTransition) {
            this._target.copy(this._targetEnd);
            this._spherical.copy(this._sphericalEnd);
        }
        const resolveImmediately = !enableTransition ||
            approxEquals(this._target.x, this._targetEnd.x, this.restThreshold) &&
                approxEquals(this._target.y, this._targetEnd.y, this.restThreshold) &&
                approxEquals(this._target.z, this._targetEnd.z, this.restThreshold) &&
                approxEquals(this._spherical.theta, this._sphericalEnd.theta, this.restThreshold) &&
                approxEquals(this._spherical.phi, this._sphericalEnd.phi, this.restThreshold) &&
                approxEquals(this._spherical.radius, this._sphericalEnd.radius, this.restThreshold);
        return this._createOnRestPromise(resolveImmediately);
    }
    setPosition(positionX, positionY, positionZ, enableTransition = false) {
        return this.setLookAt(positionX, positionY, positionZ, this._targetEnd.x, this._targetEnd.y, this._targetEnd.z, enableTransition);
    }
    setTarget(targetX, targetY, targetZ, enableTransition = false) {
        const pos = this.getPosition(_v3A);
        return this.setLookAt(pos.x, pos.y, pos.z, targetX, targetY, targetZ, enableTransition);
    }
    setFocalOffset(x, y, z, enableTransition = false) {
        this._focalOffsetEnd.set(x, y, z);
        this._needsUpdate = true;
        if (!enableTransition) {
            this._focalOffset.copy(this._focalOffsetEnd);
        }
        const resolveImmediately = !enableTransition ||
            approxEquals(this._focalOffset.x, this._focalOffsetEnd.x, this.restThreshold) &&
                approxEquals(this._focalOffset.y, this._focalOffsetEnd.y, this.restThreshold) &&
                approxEquals(this._focalOffset.z, this._focalOffsetEnd.z, this.restThreshold);
        return this._createOnRestPromise(resolveImmediately);
    }
    setOrbitPoint(targetX, targetY, targetZ) {
        _xColumn.setFromMatrixColumn(this._camera.matrixWorldInverse, 0);
        _yColumn.setFromMatrixColumn(this._camera.matrixWorldInverse, 1);
        _zColumn.setFromMatrixColumn(this._camera.matrixWorldInverse, 2);
        const position = _v3A.set(targetX, targetY, targetZ);
        const distance = position.distanceTo(this._camera.position);
        const cameraToPoint = position.sub(this._camera.position);
        _xColumn.multiplyScalar(cameraToPoint.x);
        _yColumn.multiplyScalar(cameraToPoint.y);
        _zColumn.multiplyScalar(cameraToPoint.z);
        _v3A.copy(_xColumn).add(_yColumn).add(_zColumn);
        _v3A.z = _v3A.z + distance;
        this.dollyTo(distance, false);
        this.setFocalOffset(-_v3A.x, _v3A.y, -_v3A.z, false);
        this.moveTo(targetX, targetY, targetZ, false);
    }
    setBoundary(box3) {
        if (!box3) {
            this._boundary.min.set(-Infinity, -Infinity, -Infinity);
            this._boundary.max.set(Infinity, Infinity, Infinity);
            this._needsUpdate = true;
            return;
        }
        this._boundary.copy(box3);
        this._boundary.clampPoint(this._targetEnd, this._targetEnd);
        this._needsUpdate = true;
    }
    setViewport(viewportOrX, y, width, height) {
        if (viewportOrX === null) {
            this._viewport = null;
            return;
        }
        this._viewport = this._viewport || new THREE.Vector4();
        if (typeof viewportOrX === 'number') {
            this._viewport.set(viewportOrX, y, width, height);
        }
        else {
            this._viewport.copy(viewportOrX);
        }
    }
    getDistanceToFitBox(width, height, depth) {
        if (notSupportedInOrthographicCamera(this._camera, 'getDistanceToFitBox'))
            return this._spherical.radius;
        const boundingRectAspect = width / height;
        const fov = this._camera.getEffectiveFOV() * THREE.MathUtils.DEG2RAD;
        const aspect = this._camera.aspect;
        const heightToFit = boundingRectAspect < aspect ? height : width / aspect;
        return heightToFit * 0.5 / Math.tan(fov * 0.5) + depth * 0.5;
    }
    getDistanceToFit(width, height, depth) {
        console.warn('camera-controls: getDistanceToFit() has been renamed to getDistanceToFitBox()');
        return this.getDistanceToFitBox(width, height, depth);
    }
    getDistanceToFitSphere(radius) {
        if (notSupportedInOrthographicCamera(this._camera, 'getDistanceToFitSphere'))
            return this._spherical.radius;
        const vFOV = this._camera.getEffectiveFOV() * THREE.MathUtils.DEG2RAD;
        const hFOV = Math.atan(Math.tan(vFOV * 0.5) * this._camera.aspect) * 2;
        const fov = 1 < this._camera.aspect ? vFOV : hFOV;
        return radius / (Math.sin(fov * 0.5));
    }
    getTarget(out) {
        const _out = !!out && out.isVector3 ? out : new THREE.Vector3();
        return _out.copy(this._targetEnd);
    }
    getPosition(out) {
        const _out = !!out && out.isVector3 ? out : new THREE.Vector3();
        return _out.setFromSpherical(this._sphericalEnd).applyQuaternion(this._yAxisUpSpaceInverse).add(this._targetEnd);
    }
    getFocalOffset(out) {
        const _out = !!out && out.isVector3 ? out : new THREE.Vector3();
        return _out.copy(this._focalOffsetEnd);
    }
    normalizeRotations() {
        this._sphericalEnd.theta = this._sphericalEnd.theta % PI_2;
        if (this._sphericalEnd.theta < 0)
            this._sphericalEnd.theta += PI_2;
        this._spherical.theta += PI_2 * Math.round((this._sphericalEnd.theta - this._spherical.theta) / PI_2);
    }
    reset(enableTransition = false) {
        const promises = [
            this.setLookAt(this._position0.x, this._position0.y, this._position0.z, this._target0.x, this._target0.y, this._target0.z, enableTransition),
            this.setFocalOffset(this._focalOffset0.x, this._focalOffset0.y, this._focalOffset0.z, enableTransition),
            this.zoomTo(this._zoom0, enableTransition),
        ];
        return Promise.all(promises);
    }
    saveState() {
        this._target0.copy(this._target);
        this._position0.copy(this._camera.position);
        this._zoom0 = this._zoom;
    }
    updateCameraUp() {
        this._yAxisUpSpace.setFromUnitVectors(this._camera.up, _AXIS_Y);
        quatInvertCompat(this._yAxisUpSpaceInverse.copy(this._yAxisUpSpace));
    }
    update(delta) {
        const dampingFactor = this._state === ACTION.NONE ? this.dampingFactor : this.draggingDampingFactor;
        const lerpRatio = Math.min(dampingFactor * delta * 60, 1);
        const deltaTheta = this._sphericalEnd.theta - this._spherical.theta;
        const deltaPhi = this._sphericalEnd.phi - this._spherical.phi;
        const deltaRadius = this._sphericalEnd.radius - this._spherical.radius;
        const deltaTarget = _v3A.subVectors(this._targetEnd, this._target);
        const deltaOffset = _v3B.subVectors(this._focalOffsetEnd, this._focalOffset);
        if (!approxZero(deltaTheta) ||
            !approxZero(deltaPhi) ||
            !approxZero(deltaRadius) ||
            !approxZero(deltaTarget.x) ||
            !approxZero(deltaTarget.y) ||
            !approxZero(deltaTarget.z) ||
            !approxZero(deltaOffset.x) ||
            !approxZero(deltaOffset.y) ||
            !approxZero(deltaOffset.z)) {
            this._spherical.set(this._spherical.radius + deltaRadius * lerpRatio, this._spherical.phi + deltaPhi * lerpRatio, this._spherical.theta + deltaTheta * lerpRatio);
            this._target.add(deltaTarget.multiplyScalar(lerpRatio));
            this._focalOffset.add(deltaOffset.multiplyScalar(lerpRatio));
            this._needsUpdate = true;
        }
        else {
            this._spherical.copy(this._sphericalEnd);
            this._target.copy(this._targetEnd);
            this._focalOffset.copy(this._focalOffsetEnd);
        }
        if (this._dollyControlAmount !== 0) {
            if (isPerspectiveCamera(this._camera)) {
                const camera = this._camera;
                const direction = _v3A.setFromSpherical(this._sphericalEnd).applyQuaternion(this._yAxisUpSpaceInverse).normalize().negate();
                const planeX = _v3B.copy(direction).cross(camera.up).normalize();
                if (planeX.lengthSq() === 0)
                    planeX.x = 1.0;
                const planeY = _v3C.crossVectors(planeX, direction);
                const worldToScreen = this._sphericalEnd.radius * Math.tan(camera.getEffectiveFOV() * THREE.MathUtils.DEG2RAD * 0.5);
                const prevRadius = this._sphericalEnd.radius - this._dollyControlAmount;
                const lerpRatio = (prevRadius - this._sphericalEnd.radius) / this._sphericalEnd.radius;
                const cursor = _v3A.copy(this._targetEnd)
                    .add(planeX.multiplyScalar(this._dollyControlCoord.x * worldToScreen * camera.aspect))
                    .add(planeY.multiplyScalar(this._dollyControlCoord.y * worldToScreen));
                this._targetEnd.lerp(cursor, lerpRatio);
                this._target.copy(this._targetEnd);
            }
            else if (isOrthographicCamera(this._camera)) {
                const camera = this._camera;
                const worldPosition = _v3A.set(this._dollyControlCoord.x, this._dollyControlCoord.y, (camera.near + camera.far) / (camera.near - camera.far)).unproject(camera);
                const quaternion = _v3B.set(0, 0, -1).applyQuaternion(camera.quaternion);
                const divisor = quaternion.dot(camera.up);
                const distance = approxZero(divisor) ? -worldPosition.dot(camera.up) : -worldPosition.dot(camera.up) / divisor;
                const cursor = _v3C.copy(worldPosition).add(quaternion.multiplyScalar(distance));
                this._targetEnd.lerp(cursor, 1 - camera.zoom / this._dollyControlAmount);
                this._target.copy(this._targetEnd);
            }
            this._dollyControlAmount = 0;
        }
        const maxDistance = this._collisionTest();
        this._spherical.radius = Math.min(this._spherical.radius, maxDistance);
        this._spherical.makeSafe();
        this._camera.position.setFromSpherical(this._spherical).applyQuaternion(this._yAxisUpSpaceInverse).add(this._target);
        this._camera.lookAt(this._target);
        const affectOffset = !approxZero(this._focalOffset.x) ||
            !approxZero(this._focalOffset.y) ||
            !approxZero(this._focalOffset.z);
        if (affectOffset) {
            this._camera.updateMatrix();
            _xColumn.setFromMatrixColumn(this._camera.matrix, 0);
            _yColumn.setFromMatrixColumn(this._camera.matrix, 1);
            _zColumn.setFromMatrixColumn(this._camera.matrix, 2);
            _xColumn.multiplyScalar(this._focalOffset.x);
            _yColumn.multiplyScalar(-this._focalOffset.y);
            _zColumn.multiplyScalar(this._focalOffset.z);
            _v3A.copy(_xColumn).add(_yColumn).add(_zColumn);
            this._camera.position.add(_v3A);
        }
        if (this._boundaryEnclosesCamera) {
            this._encloseToBoundary(this._camera.position.copy(this._target), _v3A.setFromSpherical(this._spherical).applyQuaternion(this._yAxisUpSpaceInverse), 1.0);
        }
        const zoomDelta = this._zoomEnd - this._zoom;
        this._zoom += zoomDelta * lerpRatio;
        if (this._camera.zoom !== this._zoom) {
            if (approxZero(zoomDelta))
                this._zoom = this._zoomEnd;
            this._camera.zoom = this._zoom;
            this._camera.updateProjectionMatrix();
            this._updateNearPlaneCorners();
            this._needsUpdate = true;
        }
        const updated = this._needsUpdate;
        if (updated && !this._updatedLastTime) {
            this._hasRested = false;
            this.dispatchEvent({ type: 'wake' });
            this.dispatchEvent({ type: 'update' });
        }
        else if (updated) {
            this.dispatchEvent({ type: 'update' });
            if (approxZero(deltaTheta, this.restThreshold) &&
                approxZero(deltaPhi, this.restThreshold) &&
                approxZero(deltaRadius, this.restThreshold) &&
                approxZero(deltaTarget.x, this.restThreshold) &&
                approxZero(deltaTarget.y, this.restThreshold) &&
                approxZero(deltaTarget.z, this.restThreshold) &&
                approxZero(deltaOffset.x, this.restThreshold) &&
                approxZero(deltaOffset.y, this.restThreshold) &&
                approxZero(deltaOffset.z, this.restThreshold) &&
                !this._hasRested) {
                this._hasRested = true;
                this.dispatchEvent({ type: 'rest' });
            }
        }
        else if (!updated && this._updatedLastTime) {
            this.dispatchEvent({ type: 'sleep' });
        }
        this._updatedLastTime = updated;
        this._needsUpdate = false;
        return updated;
    }
    toJSON() {
        return JSON.stringify({
            enabled: this._enabled,
            minDistance: this.minDistance,
            maxDistance: infinityToMaxNumber(this.maxDistance),
            minZoom: this.minZoom,
            maxZoom: infinityToMaxNumber(this.maxZoom),
            minPolarAngle: this.minPolarAngle,
            maxPolarAngle: infinityToMaxNumber(this.maxPolarAngle),
            minAzimuthAngle: infinityToMaxNumber(this.minAzimuthAngle),
            maxAzimuthAngle: infinityToMaxNumber(this.maxAzimuthAngle),
            dampingFactor: this.dampingFactor,
            draggingDampingFactor: this.draggingDampingFactor,
            dollySpeed: this.dollySpeed,
            truckSpeed: this.truckSpeed,
            dollyToCursor: this.dollyToCursor,
            verticalDragToForward: this.verticalDragToForward,
            target: this._targetEnd.toArray(),
            position: _v3A.setFromSpherical(this._sphericalEnd).add(this._targetEnd).toArray(),
            zoom: this._zoomEnd,
            focalOffset: this._focalOffsetEnd.toArray(),
            target0: this._target0.toArray(),
            position0: this._position0.toArray(),
            zoom0: this._zoom0,
            focalOffset0: this._focalOffset0.toArray(),
        });
    }
    fromJSON(json, enableTransition = false) {
        const obj = JSON.parse(json);
        const position = _v3A.fromArray(obj.position);
        this.enabled = obj.enabled;
        this.minDistance = obj.minDistance;
        this.maxDistance = maxNumberToInfinity(obj.maxDistance);
        this.minZoom = obj.minZoom;
        this.maxZoom = maxNumberToInfinity(obj.maxZoom);
        this.minPolarAngle = obj.minPolarAngle;
        this.maxPolarAngle = maxNumberToInfinity(obj.maxPolarAngle);
        this.minAzimuthAngle = maxNumberToInfinity(obj.minAzimuthAngle);
        this.maxAzimuthAngle = maxNumberToInfinity(obj.maxAzimuthAngle);
        this.dampingFactor = obj.dampingFactor;
        this.draggingDampingFactor = obj.draggingDampingFactor;
        this.dollySpeed = obj.dollySpeed;
        this.truckSpeed = obj.truckSpeed;
        this.dollyToCursor = obj.dollyToCursor;
        this.verticalDragToForward = obj.verticalDragToForward;
        this._target0.fromArray(obj.target0);
        this._position0.fromArray(obj.position0);
        this._zoom0 = obj.zoom0;
        this._focalOffset0.fromArray(obj.focalOffset0);
        this.moveTo(obj.target[0], obj.target[1], obj.target[2], enableTransition);
        _sphericalA.setFromVector3(position.sub(this._targetEnd).applyQuaternion(this._yAxisUpSpace));
        this.rotateTo(_sphericalA.theta, _sphericalA.phi, enableTransition);
        this.zoomTo(obj.zoom, enableTransition);
        this.setFocalOffset(obj.focalOffset[0], obj.focalOffset[1], obj.focalOffset[2], enableTransition);
        this._needsUpdate = true;
    }
    dispose() {
        this._removeAllEventListeners();
    }
    _findPointerById(pointerId) {
        let pointer = null;
        this._activePointers.some((activePointer) => {
            if (activePointer.pointerId === pointerId) {
                pointer = activePointer;
                return true;
            }
            return false;
        });
        return pointer;
    }
    _encloseToBoundary(position, offset, friction) {
        const offsetLength2 = offset.lengthSq();
        if (offsetLength2 === 0.0) {
            return position;
        }
        const newTarget = _v3B.copy(offset).add(position);
        const clampedTarget = this._boundary.clampPoint(newTarget, _v3C);
        const deltaClampedTarget = clampedTarget.sub(newTarget);
        const deltaClampedTargetLength2 = deltaClampedTarget.lengthSq();
        if (deltaClampedTargetLength2 === 0.0) {
            return position.add(offset);
        }
        else if (deltaClampedTargetLength2 === offsetLength2) {
            return position;
        }
        else if (friction === 0.0) {
            return position.add(offset).add(deltaClampedTarget);
        }
        else {
            const offsetFactor = 1.0 + friction * deltaClampedTargetLength2 / offset.dot(deltaClampedTarget);
            return position
                .add(_v3B.copy(offset).multiplyScalar(offsetFactor))
                .add(deltaClampedTarget.multiplyScalar(1.0 - friction));
        }
    }
    _updateNearPlaneCorners() {
        if (isPerspectiveCamera(this._camera)) {
            const camera = this._camera;
            const near = camera.near;
            const fov = camera.getEffectiveFOV() * THREE.MathUtils.DEG2RAD;
            const heightHalf = Math.tan(fov * 0.5) * near;
            const widthHalf = heightHalf * camera.aspect;
            this._nearPlaneCorners[0].set(-widthHalf, -heightHalf, 0);
            this._nearPlaneCorners[1].set(widthHalf, -heightHalf, 0);
            this._nearPlaneCorners[2].set(widthHalf, heightHalf, 0);
            this._nearPlaneCorners[3].set(-widthHalf, heightHalf, 0);
        }
        else if (isOrthographicCamera(this._camera)) {
            const camera = this._camera;
            const zoomInv = 1 / camera.zoom;
            const left = camera.left * zoomInv;
            const right = camera.right * zoomInv;
            const top = camera.top * zoomInv;
            const bottom = camera.bottom * zoomInv;
            this._nearPlaneCorners[0].set(left, top, 0);
            this._nearPlaneCorners[1].set(right, top, 0);
            this._nearPlaneCorners[2].set(right, bottom, 0);
            this._nearPlaneCorners[3].set(left, bottom, 0);
        }
    }
    _collisionTest() {
        let distance = Infinity;
        const hasCollider = this.colliderMeshes.length >= 1;
        if (!hasCollider)
            return distance;
        if (notSupportedInOrthographicCamera(this._camera, '_collisionTest'))
            return distance;
        const direction = _v3A.setFromSpherical(this._spherical).divideScalar(this._spherical.radius);
        _rotationMatrix.lookAt(_ORIGIN, direction, this._camera.up);
        for (let i = 0; i < 4; i++) {
            const nearPlaneCorner = _v3B.copy(this._nearPlaneCorners[i]);
            nearPlaneCorner.applyMatrix4(_rotationMatrix);
            const origin = _v3C.addVectors(this._target, nearPlaneCorner);
            _raycaster.set(origin, direction);
            _raycaster.far = this._spherical.radius + 1;
            const intersects = _raycaster.intersectObjects(this.colliderMeshes);
            if (intersects.length !== 0 && intersects[0].distance < distance) {
                distance = intersects[0].distance;
            }
        }
        return distance;
    }
    _getClientRect(target) {
        const rect = this._domElement.getBoundingClientRect();
        target.x = rect.left;
        target.y = rect.top;
        if (this._viewport) {
            target.x += this._viewport.x;
            target.y += rect.height - this._viewport.w - this._viewport.y;
            target.width = this._viewport.z;
            target.height = this._viewport.w;
        }
        else {
            target.width = rect.width;
            target.height = rect.height;
        }
        return target;
    }
    _createOnRestPromise(resolveImmediately) {
        if (resolveImmediately)
            return Promise.resolve();
        this._hasRested = false;
        this.dispatchEvent({ type: 'transitionstart' });
        return new Promise((resolve) => {
            const onResolve = () => {
                this.removeEventListener('rest', onResolve);
                resolve();
            };
            this.addEventListener('rest', onResolve);
        });
    }
    _removeAllEventListeners() { }
}
function createBoundingSphere(object3d, out) {
    const boundingSphere = out;
    const center = boundingSphere.center;
    _box3A.makeEmpty();
    object3d.traverseVisible((object) => {
        if (!object.isMesh)
            return;
        _box3A.expandByObject(object);
    });
    _box3A.getCenter(center);
    let maxRadiusSq = 0;
    object3d.traverseVisible((object) => {
        if (!object.isMesh)
            return;
        const mesh = object;
        const geometry = mesh.geometry.clone();
        geometry.applyMatrix4(mesh.matrixWorld);
        if (geometry.isBufferGeometry) {
            const bufferGeometry = geometry;
            const position = bufferGeometry.attributes.position;
            for (let i = 0, l = position.count; i < l; i++) {
                _v3A.fromBufferAttribute(position, i);
                maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_v3A));
            }
        }
        else {
            const position = geometry.attributes.position;
            const vector = new THREE.Vector3();
            for (let i = 0, l = position.count; i < l; i++) {
                vector.fromBufferAttribute(position, i);
                maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
            }
        }
    });
    boundingSphere.radius = Math.sqrt(maxRadiusSq);
    return boundingSphere;
}

export { CameraControls as default };
