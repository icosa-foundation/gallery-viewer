// Copyright 2018 Google Inc.
attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texcoord0;
varying vec4 v_color;
varying vec2 v_texcoord0;
varying vec4 v_unbloomedColor;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float u_EmissionGain;
vec4 bloomColor(vec4 color, float gain) {
float cmin = length(color.rgb) * .05;
color.rgb = max(color.rgb, vec3(cmin, cmin, cmin));
color.r = pow(color.r, 2.2);
color.g = pow(color.g, 2.2);
color.b = pow(color.b, 2.2);
color.a = pow(color.a, 2.2);
color.rgb *= 2.0 * exp(gain * 10.0);
return color;
}
void main() {
gl_Position = projectionMatrix * modelViewMatrix * a_position;
v_color = bloomColor(a_color, u_EmissionGain);
v_unbloomedColor = a_color;
v_texcoord0 = a_texcoord0;
}
