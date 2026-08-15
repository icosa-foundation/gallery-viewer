// Copyright 2018 Google Inc.
precision mediump float;
varying vec4 v_color;
varying vec2 v_texcoord0;
uniform vec4 u_TintColor;
uniform sampler2D u_MainTex;
void main() {
gl_FragColor = v_color * u_TintColor * texture2D(u_MainTex, v_texcoord0).w;
}
