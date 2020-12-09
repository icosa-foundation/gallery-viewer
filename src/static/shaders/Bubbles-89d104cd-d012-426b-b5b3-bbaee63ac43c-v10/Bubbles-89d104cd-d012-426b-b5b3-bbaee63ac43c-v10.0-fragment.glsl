// Copyright 2018 Google Inc.
precision mediump float;
varying vec4 v_color;
varying vec2 v_texcoord0;
uniform sampler2D u_MainTex;
void main() {
    vec4 tex = texture2D(u_MainTex, v_texcoord0);
    vec3 basecolor = v_color.rgb * tex.rgb;
    vec3 highlightcolor = tex.aaa;
    gl_FragColor.rgb = basecolor + highlightcolor;
    gl_FragColor.a = 1.0;
}
