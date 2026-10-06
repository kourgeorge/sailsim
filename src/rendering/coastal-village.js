import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createBuildings } from './building-kit.js';
import { islandHeight } from './geography.js';

const STREET_WIDTH = 3;

// Low dry-stone walls along both sides of each street, open where a path joins,
// so the road reads from the water as a line with its own shadow.
function streetWalls(lanes, islands, nordic) {
  const streets = lanes.filter((lane) => lane[0].width >= STREET_WIDTH),
    joins = lanes.filter((lane) => lane[0].width < STREET_WIDTH).map((lane) => lane.at(-1));
  const stone = new THREE.Color(nordic ? '#8f8b80' : '#d9cfb4'), shade = new THREE.Color(), parts = [];
  for (const street of streets)
    for (let i = 1; i < street.length; i++) {
      const a = street[i - 1], b = street[i], length = Math.hypot(b.x - a.x, b.z - a.z);
      const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, nx = -(b.z - a.z) / length, nz = (b.x - a.x) / length;
      for (const side of [-1, 1]) {
        const x = mx + nx * side * (a.width / 2 + 0.35), z = mz + nz * side * (a.width / 2 + 0.35);
        if (joins.some((join) => Math.hypot(join.x - x, join.z - z) < 3.2)) continue;
        const y = islandHeight(x, z, islands[a.islandIndex]);
        if (y < 0.6) continue;
        const wall = new THREE.BoxGeometry(0.55, 0.5 + ((i * 7 + side) % 3) * 0.06, length + 0.1).toNonIndexed();
        wall.rotateY(Math.atan2(b.x - a.x, b.z - a.z));
        wall.translate(x, y + 0.2, z);
        shade.copy(stone).multiplyScalar(0.86 + ((i * 13 + side * 5) % 7) * 0.03);
        wall.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: wall.attributes.position.count }, () => [shade.r, shade.g, shade.b]).flat(), 3));
        parts.push(wall);
      }
    }
  if (!parts.length) return null;
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  return geometry;
}

// Lanes draped over the hillside: a pale worn centre between darker verges,
// raised a touch so the coarser terrain mesh never covers them.
function createLanes(scene, lanes, islands, nordic) {
  if (!lanes.length) return null;
  const positions = [], colors = [], index = [];
  const verge = new THREE.Color(nordic ? '#8a8577' : '#b9a983'),
    centre = new THREE.Color(nordic ? '#c2bcae' : '#ece2c6');
  for (const lane of lanes) {
    const first = positions.length / 3;
    lane.forEach((point, i) => {
      const prev = lane[Math.max(0, i - 1)], next = lane[Math.min(lane.length - 1, i + 1)];
      const length = Math.hypot(next.x - prev.x, next.z - prev.z) || 1,
        nx = -(next.z - prev.z) / length, nz = (next.x - prev.x) / length,
        island = islands[point.islandIndex];
      for (const [side, color] of [[-1, verge], [0, centre], [1, verge]]) {
        const x = point.x + nx * side * point.width / 2, z = point.z + nz * side * point.width / 2;
        positions.push(x, Math.max(point.y, islandHeight(x, z, island)) + 0.4, z);
        colors.push(color.r, color.g, color.b);
      }
      if (i) {
        const a = first + (i - 1) * 3, b = a + 3;
        index.push(a, a + 1, b, a + 1, b + 1, b, a + 1, a + 2, b + 1, a + 2, b + 2, b + 1);
      }
    });
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }),
  );
  mesh.name = 'Village lanes';
  mesh.receiveShadow = true;
  scene.add(mesh);
  const walls = streetWalls(lanes, islands, nordic);
  if (walls) {
    const wallMesh = new THREE.Mesh(walls, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    wallMesh.name = 'Village street walls';
    wallMesh.castShadow = wallMesh.receiveShadow = true;
    scene.add(wallMesh);
  }
  return mesh;
}

// Practice-water cottages and chapel: detailed houses with framed windows,
// shutters, tiled roofs and chimneys (see building-kit.js), joined by lanes.
export function createCoastalVillage(scene, features, { nordic = false, quality = null, lanes = [], islands = [] } = {}) {
  const town = createBuildings(scene, features, nordic ? 'nordic' : 'mediterranean', {
    quality,
    name: 'Coastal cottages and chapel',
    castShadow: true,
  });
  const roads = createLanes(scene, lanes, islands, nordic);
  if (town) town.lanes = roads;
  return town;
}
