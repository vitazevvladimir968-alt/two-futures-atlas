/** GLSL for the Earth surface, cloud shell and atmosphere halo. World-space lighting. */

export const surfaceVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const earthFragment = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uNormal;
uniform sampler2D uOcean;
uniform sampler2D uClouds;
uniform vec3 uSunDir;
uniform vec3 uAtmo;
uniform float uNormalStrength;
uniform float uNightBoost;
uniform float uStress;
uniform float uThrive;
uniform float uCloudRot;
uniform float uCloudShadow;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 T = cross(vec3(0.0, 1.0, 0.0), N);
  float tl = length(T);
  T = tl > 1e-4 ? T / tl : vec3(1.0, 0.0, 0.0);
  vec3 B = cross(N, T);
  vec3 tn = texture2D(uNormal, vUv).xyz * 2.0 - 1.0;
  tn.xy *= uNormalStrength;
  vec3 Np = normalize(T * tn.x + B * tn.y + N * max(tn.z, 0.05));

  vec3 L = normalize(uSunDir);
  vec3 V = normalize(cameraPosition - vPosW);
  float nlGeo = dot(N, L);
  float nl = max(dot(Np, L), 0.0);
  float dayMix = smoothstep(-0.1, 0.22, nlGeo);

  float ocean = texture2D(uOcean, vUv).r;
  vec3 day = texture2D(uDay, vUv).rgb;

  // Scenario grading: a visual metaphor only, not simulated land cover.
  float lum = dot(day, vec3(0.2126, 0.7152, 0.0722));
  vec3 parched = vec3(lum) * vec3(1.18, 0.98, 0.74);
  day = mix(day, parched, uStress * 0.6 * (1.0 - ocean));
  day = mix(day, day * vec3(0.94, 1.07, 0.98), uThrive * (1.0 - ocean));

  float cs = texture2D(uClouds, vec2(fract(vUv.x - uCloudRot), vUv.y)).r;
  vec3 lit = day * (nl * 1.25 + 0.015) * (1.0 - cs * uCloudShadow) * dayMix;

  vec3 H = normalize(L + V);
  float nh = max(dot(N, H), 0.0);
  float nh2 = nh * nh; float nh4 = nh2 * nh2; float nh8 = nh4 * nh4;
  float nh32 = nh8 * nh8; nh32 *= nh32;
  float sunSide = smoothstep(0.0, 0.25, nlGeo);
  vec3 spec = (vec3(1.0, 0.93, 0.82) * nh32 * nh32 * 1.4 + vec3(0.55, 0.75, 1.0) * nh8 * 0.05)
    * ocean * sunSide * (1.0 - cs * 0.8);

  vec3 night = texture2D(uNight, vUv).rgb;
  night = max(night - vec3(0.035), vec3(0.0));
  vec3 nightCol = night * vec3(1.0, 0.82, 0.55) * uNightBoost * (1.0 - dayMix) * (1.0 - cs * 0.65);

  float facing = max(dot(N, V), 0.0);
  float f = 1.0 - facing;
  float fres = f * f * f;
  vec3 rim = uAtmo * fres * (0.08 + 0.9 * smoothstep(-0.25, 0.6, nlGeo)) * 0.75;

  vec3 col = lit + spec + nightCol + rim;
  col = min(col, vec3(8.0));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const cloudFragment = /* glsl */ `
uniform sampler2D uClouds;
uniform vec3 uSunDir;
uniform float uOpacity;
uniform vec3 uTint;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec3 N = normalize(vNormalW);
  float nl = dot(N, normalize(uSunDir));
  float a = texture2D(uClouds, vUv).r;
  a = smoothstep(0.08, 0.9, a) * uOpacity;
  float light = smoothstep(-0.15, 0.35, nl) * (0.35 + 0.75 * max(nl, 0.0));
  vec3 col = uTint * (light + 0.004);
  gl_FragColor = vec4(col, a * (0.12 + 0.88 * smoothstep(-0.25, 0.15, nl)));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const atmoVertex = /* glsl */ `
varying vec3 vNormalV;
varying vec3 vNormalW;
void main() {
  vNormalV = normalize(normalMatrix * normal);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const atmoFragment = /* glsl */ `
uniform vec3 uAtmo;
uniform vec3 uSunDir;
uniform float uStrength;
varying vec3 vNormalV;
varying vec3 vNormalW;
void main() {
  float z = clamp(-vNormalV.z, 0.0, 1.0);
  float glow = smoothstep(0.0, 0.62, z);
  glow = glow * glow;
  float sun = smoothstep(-0.45, 0.5, dot(normalize(vNormalW), normalize(uSunDir)));
  vec3 col = uAtmo * glow * uStrength * (0.12 + 0.88 * sun);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;