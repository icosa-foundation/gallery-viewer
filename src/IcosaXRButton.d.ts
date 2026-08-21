import { WebGLRenderer } from "three";

export type IcosaXRSessionMode = 'immersive-ar' | 'immersive-vr';

export interface IcosaXRButtonCallbacks {
    onSessionStarted?: (mode: IcosaXRSessionMode, session: XRSession) => void;
    onSessionEnded?: (mode: IcosaXRSessionMode, session: XRSession) => void;
    onSessionError?: (mode: IcosaXRSessionMode, error: unknown) => void;
}

export class XRButton {
    static createButton(
        renderer: WebGLRenderer,
        sessionInit?: XRSessionInit,
        allowAR?: boolean,
        callbacks?: IcosaXRButtonCallbacks
    ): HTMLElement;
}
