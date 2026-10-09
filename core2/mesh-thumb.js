const fs = require("fs-extra"),
  sharp = require("sharp");

// Renders STL/OBJ thumbs without a browser: flat shaded mesh rasterized with
// a z-buffer, supersampled then downscaled by sharp for antialiasing.

const SIZE = 800;
const SUPERSAMPLE = 2;
// fraction of the image the model fills
const FILL = 0.86;
// same angle and lights as ThreeDPreview.vue
const ROTATION = { x: Math.PI / 18, y: -Math.PI / 10, z: 0 };
const AMBIENT = 0.42;
const LIGHTS = [
  { dir: [1.2, 1.4, 1.1], color: [1, 1, 1], intensity: 0.78 },
  { dir: [-1.1, 0.3, 0.5], color: [0xdd / 255, 0xe6 / 255, 1], intensity: 0.28 },
];
const BASE_COLOR = [0.86, 0.87, 0.89];

module.exports = {
  // 3x3 rotation, row-major, from model to view space (camera looks down -z)
  isValidViewMatrix(view_matrix) {
    return (
      Array.isArray(view_matrix) &&
      view_matrix.length === 9 &&
      view_matrix.every((v) => typeof v === "number" && Number.isFinite(v))
    );
  },

  async makeThumb({
    full_media_path,
    full_path_to_thumb,
    media_type,
    view_matrix,
  }) {
    const buffer = await fs.readFile(full_media_path);
    const positions =
      media_type === "obj" ? parseOBJ(buffer.toString("utf8")) : parseSTL(buffer);
    if (positions.length === 0) throw new Error("mesh has no triangles");

    const size = SIZE * SUPERSAMPLE;
    const rotation = module.exports.isValidViewMatrix(view_matrix)
      ? view_matrix
      : rotationMatrix(ROTATION);
    const pixels = render({ positions, size, rotation });

    await fs.ensureDir(require("path").dirname(full_path_to_thumb));
    await sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
      .resize(SIZE, SIZE)
      .png()
      .toFile(full_path_to_thumb);
  },
};

function parseSTL(buffer) {
  if (buffer.length >= 84) {
    const count = buffer.readUInt32LE(80);
    // binary files may start with "solid" too: trust the size instead
    if (84 + count * 50 === buffer.length) {
      const positions = new Float32Array(count * 9);
      for (let i = 0; i < count; i++) {
        const offset = 84 + i * 50 + 12; // skip normal
        for (let j = 0; j < 9; j++)
          positions[i * 9 + j] = buffer.readFloatLE(offset + j * 4);
      }
      return positions;
    }
  }

  const text = buffer.toString("utf8");
  const values = [];
  const re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/g;
  let m;
  while ((m = re.exec(text))) values.push(+m[1], +m[2], +m[3]);
  // drop an incomplete last facet
  values.length -= values.length % 9;
  return Float32Array.from(values);
}

function parseOBJ(text) {
  const vertices = [];
  const values = [];
  for (const line of text.split("\n")) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === "v") {
      vertices.push([+parts[1], +parts[2], +parts[3]]);
    } else if (parts[0] === "f") {
      // "f 1/2/3 4//6 -1": keep vertex index, negative ones are relative
      const ids = parts.slice(1).map((p) => {
        const i = parseInt(p, 10);
        return i < 0 ? vertices.length + i : i - 1;
      });
      // fan triangulation of polygons
      for (let i = 1; i < ids.length - 1; i++)
        for (const id of [ids[0], ids[i], ids[i + 1]]) {
          const v = vertices[id];
          if (!v) continue;
          values.push(v[0], v[1], v[2]);
        }
    }
  }
  values.length -= values.length % 9;
  return Float32Array.from(values);
}

function rotationMatrix({ x, y, z }) {
  // three.js "XYZ" euler order
  const a = Math.cos(x),
    b = Math.sin(x),
    c = Math.cos(y),
    d = Math.sin(y),
    e = Math.cos(z),
    f = Math.sin(z);
  return [
    c * e,
    -c * f,
    d,
    a * f + b * e * d,
    a * e - b * f * d,
    -b * c,
    b * f - a * e * d,
    b * e + a * f * d,
    a * c,
  ];
}

function normalize(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function render({ positions, size, rotation: r }) {
  const n = positions.length / 3;

  // rotate, then center and fit the rotated bounds in the image
  const pts = new Float32Array(n * 3);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) {
    const x = positions[i * 3],
      y = positions[i * 3 + 1],
      z = positions[i * 3 + 2];
    const rotated = [
      r[0] * x + r[1] * y + r[2] * z,
      r[3] * x + r[4] * y + r[5] * z,
      r[6] * x + r[7] * y + r[8] * z,
    ];
    for (let k = 0; k < 3; k++) {
      pts[i * 3 + k] = rotated[k];
      if (rotated[k] < min[k]) min[k] = rotated[k];
      if (rotated[k] > max[k]) max[k] = rotated[k];
    }
  }
  if (!min.every(Number.isFinite) || !max.every(Number.isFinite))
    throw new Error("mesh has invalid coordinates");

  const center = [0, 1, 2].map((k) => (min[k] + max[k]) / 2);
  const max_extent = Math.max(max[0] - min[0], max[1] - min[1]) / 2;
  const scale = (size * FILL) / 2 / (max_extent || 1);
  const half = size / 2;
  for (let i = 0; i < n; i++) {
    pts[i * 3] = half + (pts[i * 3] - center[0]) * scale;
    // image y goes down
    pts[i * 3 + 1] = half - (pts[i * 3 + 1] - center[1]) * scale;
    pts[i * 3 + 2] = (pts[i * 3 + 2] - center[2]) * scale;
  }

  const lights = LIGHTS.map((l) => ({ ...l, dir: normalize(l.dir) }));
  const pixels = Buffer.alloc(size * size * 4);
  const depth = new Float32Array(size * size).fill(-Infinity);

  for (let t = 0; t < n / 3; t++) {
    const o = t * 9;
    const x0 = pts[o],
      y0 = pts[o + 1],
      z0 = pts[o + 2],
      x1 = pts[o + 3],
      y1 = pts[o + 4],
      z1 = pts[o + 5],
      x2 = pts[o + 6],
      y2 = pts[o + 7],
      z2 = pts[o + 8];

    // signed area in screen space, skip degenerate triangles
    const area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
    if (Math.abs(area) < 1e-9) continue;

    // face normal in view space (y flipped back), facing the camera
    const ux = x1 - x0,
      uy = y0 - y1,
      uz = z1 - z0,
      vx = x2 - x0,
      vy = y0 - y2,
      vz = z2 - z0;
    let normal = normalize([uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx]);
    if (normal[2] < 0) normal = normal.map((c) => -c);

    const shade = [AMBIENT, AMBIENT, AMBIENT];
    for (const l of lights) {
      const d = Math.max(
        0,
        normal[0] * l.dir[0] + normal[1] * l.dir[1] + normal[2] * l.dir[2]
      );
      for (let k = 0; k < 3; k++) shade[k] += d * l.intensity * l.color[k];
    }
    const rgb = shade.map((s, k) =>
      Math.min(255, Math.round(s * BASE_COLOR[k] * 255))
    );

    const minx = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
    const maxx = Math.min(size - 1, Math.ceil(Math.max(x0, x1, x2)));
    const miny = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
    const maxy = Math.min(size - 1, Math.ceil(Math.max(y0, y1, y2)));

    for (let py = miny; py <= maxy; py++) {
      const sy = py + 0.5;
      for (let px = minx; px <= maxx; px++) {
        const sx = px + 0.5;
        // barycentric weights
        const w0 = ((x1 - sx) * (y2 - sy) - (x2 - sx) * (y1 - sy)) / area;
        const w1 = ((x2 - sx) * (y0 - sy) - (x0 - sx) * (y2 - sy)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;

        const z = w0 * z0 + w1 * z1 + w2 * z2;
        const idx = py * size + px;
        // camera looks down -z: higher z is closer
        if (z <= depth[idx]) continue;
        depth[idx] = z;

        pixels[idx * 4] = rgb[0];
        pixels[idx * 4 + 1] = rgb[1];
        pixels[idx * 4 + 2] = rgb[2];
        pixels[idx * 4 + 3] = 255;
      }
    }
  }

  return pixels;
}
