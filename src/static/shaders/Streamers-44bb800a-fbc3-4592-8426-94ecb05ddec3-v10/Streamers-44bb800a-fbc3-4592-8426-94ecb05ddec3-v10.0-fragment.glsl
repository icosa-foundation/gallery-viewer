// Copyright 2018 Google Inc.
precision mediump float;
varying vec4 v_color;
varying vec2 v_texcoord0;
uniform sampler2D u_MainTex;
uniform vec4 u_TintColor;
uniform float u_EmissionGain;
uniform vec4 u_time;
float rand_1_05(vec2 uv) {
float noise = (fract(sin(dot(uv,vec2(12.9898,78.233)*2.0)) * 43758.5453));
return noise;
}
void main() {
vec2 uvs = v_texcoord0;
float row_id = floor(uvs.y * 5.0);
float row_rand = rand_1_05( vec2(row_id, row_id));
uvs.x += row_rand * 200.0;
vec2 sins = sin(uvs.x * vec2(10.0,23.0) + u_time.z * vec2(5.0,3.0));
uvs.y = 5.0 * uvs.y + dot(vec2(.05, -.05), sins);
uvs.x *= .5 + row_rand * .3;
uvs.x -= u_time.y * (1.0 + mod(row_id * 1.61803398875, 1.0) - 0.5);
vec4 tex = texture2D(u_MainTex, uvs);
tex += pow(tex, vec4(2.0,2.0,2.0,2.0)) * 55.0;
tex *= mod(uvs.y,1.0);
tex *= mod(uvs.y,1.0);
tex *= 1.0 - mod(uvs.y,1.0);
tex *= 1.0 - mod(uvs.y,1.0);
vec4 color = v_color * tex * exp(u_EmissionGain * 5.0);
gl_FragColor = vec4(color.rgb * color.a,1.0);
}
