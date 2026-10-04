// Keep a short-lived visual copy of the outgoing page while the real controls
// update. Copied styles preserve ID-based layouts without duplicating any IDs.
export function createCoverSlide({ container, cover, reducedMotion }) {
  let active = null;
  let preview = null;

  function cancel() {
    preview?.layer.remove();
    preview = null;
    if (!active) return;
    const previous = active;
    active = null;
    previous.animations.forEach((animation) => animation.cancel());
    previous.layer?.remove();
    previous.surface.classList.remove('is-sliding');
  }

  function play(surface, layer, tracks, duration) {
    surface.classList.add('is-sliding');
    const animations = tracks.map(([element, from, to]) =>
      element.animate(
        [{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }],
        { duration, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'both' },
      ),
    );
    const run = { surface, layer, animations };
    active = run;
    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (active === run) cancel();
    });
  }

  function snapshot(surface) {
    const bounds = surface.getBoundingClientRect();
    const parent = container.getBoundingClientRect();
    const copy = surface.cloneNode(true);
    const originals = [surface, ...surface.querySelectorAll('*')];
    const copies = [copy, ...copy.querySelectorAll('*')];
    originals.forEach((element, index) => {
      const style = getComputedStyle(element);
      copies[index].style.cssText = Array.from(
        style,
        (property) => `${property}:${style.getPropertyValue(property)};`,
      ).join('');
      copies[index].removeAttribute('id');
    });
    copy.removeAttribute('data-section-page');
    copy.classList.remove('section-page', 'is-swiping');
    copy.classList.add('cover-slide-outgoing');
    Object.assign(copy.style, {
      position: 'absolute',
      left: `${bounds.left - parent.left}px`,
      top: `${bounds.top - parent.top}px`,
      right: 'auto',
      bottom: 'auto',
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
      minWidth: '0',
      minHeight: '0',
      maxWidth: 'none',
      maxHeight: 'none',
      margin: '0',
      transform: 'none',
      willChange: 'transform',
    });
    const layer = document.createElement('div');
    layer.className = 'cover-slide-layer';
    layer.inert = true;
    layer.setAttribute('aria-hidden', 'true');
    layer.append(copy);
    container.append(layer);
    return { layer, copy };
  }

  return {
    cancel,
    preview(surface, create, { key, direction, width, offset }) {
      if (reducedMotion.matches) return;
      if (preview?.key !== key) {
        preview?.layer.remove();
        const copy = create();
        const bounds = surface.getBoundingClientRect();
        const parent = container.getBoundingClientRect();
        const coverStyle = getComputedStyle(cover);
        const height =
          cover.clientHeight -
          parseFloat(coverStyle.paddingTop) -
          parseFloat(coverStyle.paddingBottom);
        const mobile = matchMedia('(max-width: 900px)').matches;
        for (const node of [copy, ...copy.querySelectorAll('[id]')]) {
          if (node.id) node.dataset.coverPreviewId = node.id;
          node.removeAttribute('id');
        }
        copy.removeAttribute('data-section-page');
        copy.classList.remove('section-page', 'is-swiping', 'is-sliding');
        copy.classList.add('cover-slide-preview');
        copy.dataset.noTranslate = 'true';
        Object.assign(copy.style, {
          position: 'absolute',
          left: `${bounds.left - parent.left - offset}px`,
          top: `${bounds.top - parent.top + cover.scrollTop}px`,
          width: `${bounds.width}px`,
          height: mobile || copy.classList.contains('section-detail') ? 'auto' : `${height}px`,
          minHeight: mobile ? '0' : `${height}px`,
          fontSize: coverStyle.fontSize,
          color: coverStyle.color,
          willChange: 'transform',
        });
        const layer = document.createElement('div');
        layer.className = 'cover-slide-layer';
        layer.inert = true;
        layer.setAttribute('aria-hidden', 'true');
        layer.append(copy);
        container.append(layer);
        preview = { key, layer, copy, distance: direction * width };
      }
      preview.copy.style.transform = `translateX(${preview.distance + offset}px)`;
    },
    clearPreview() {
      preview?.layer.remove();
      preview = null;
    },
    slide(surface, { offset, direction, width }, change) {
      cancel();
      if (reducedMotion.matches) {
        change();
        return;
      }
      const { layer, copy } = snapshot(surface);
      const next = change();
      const distance = direction * width;
      const duration = Math.max(180, 320 * (1 - Math.abs(offset) / width));
      play(
        next,
        layer,
        [
          [copy, offset, -distance],
          [next, distance + offset, 0],
        ],
        duration,
      );
    },
    settle(surface, offset) {
      const incoming = preview;
      preview = null;
      cancel();
      if (!offset || reducedMotion.matches) {
        incoming?.layer.remove();
        return;
      }
      const tracks = [[surface, offset, 0]];
      if (incoming) tracks.push([incoming.copy, incoming.distance + offset, incoming.distance]);
      play(surface, incoming?.layer, tracks, 200);
    },
  };
}
