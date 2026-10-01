// Dispose shared resources once when replacing a practice world.
export function disposeSceneResources(scene, { extraMaterials = [], excludedTextures = new Set() } = {}) {
  const geometries = new Set(), materials = new Set(extraMaterials.filter(value => value?.isMaterial));
  const textures = new Set(), renderTargets = new Set();
  const collectTexture = value => {
    if (value?.isTexture) textures.add(value);
    else if (Array.isArray(value)) value.forEach(collectTexture);
    else if (value?.constructor === Object) Object.values(value).forEach(collectTexture);
  };
  scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
    for (const target of [object.shadow?.map, object.shadow?.mapPass]) if (target) renderTargets.add(target);
    if (object.shadow) { object.shadow.map = null; object.shadow.mapPass = null; }
  });
  for (const material of materials) {
    for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    if (material.uniforms) Object.values(material.uniforms).forEach(uniform => collectTexture(uniform.value));
  }
  for (const target of renderTargets) {
    for (const texture of target.textures || [target.texture]) excludedTextures.add(texture);
    if (target.depthTexture) excludedTextures.add(target.depthTexture);
    target.dispose();
  }
  textures.forEach(texture => { if (!excludedTextures.has(texture)) texture.dispose(); });
  materials.forEach(material => material.dispose());
  geometries.forEach(geometry => geometry.dispose());
  scene.environment = null;scene.clear();
  return { geometries: geometries.size, materials: materials.size, textures: textures.size, renderTargets: renderTargets.size };
}
