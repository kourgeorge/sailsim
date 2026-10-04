export function preferredInterfaceLanguage(supported, environment = globalThis) {
  const match = (value) => {
    if (typeof value !== 'string') return null;
    let code = value.trim().toLowerCase().split(/[-_]/, 1)[0];
    if (code === 'iw') code = 'he'; // Older browsers may use Hebrew's former code.
    return supported.includes(code) ? code : null;
  };
  // Read the sources separately: blocked storage must not disable detection.
  try {
    const linked = match(new URL(environment.location.href).searchParams.get('lang'));
    if (linked) return linked;
  } catch {}
  try {
    const saved = match(environment.localStorage.getItem('sail-language'));
    if (saved) return saved;
  } catch {}
  try {
    const browser = environment.navigator;
    const preferences = Array.isArray(browser?.languages) ? browser.languages : [];
    for (const preference of [...preferences, browser?.language]) {
      const language = match(preference);
      if (language) return language;
    }
  } catch {}
  return 'en';
}
