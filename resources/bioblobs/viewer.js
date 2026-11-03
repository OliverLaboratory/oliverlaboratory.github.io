'use strict';
// BioBlobs M-CSA enzyme explorer: enzyme list, 3D structure (3Dmol.js) and sequence view.
// Data: manifest.json lists the enzymes. Each enzyme's data is in proteins/<id>.json and its
// structure in structures/<id>.pdb, or, when an entry names a `bundle`, both come from that
// (optionally gzipped) bundle file.
(() => {
  const $ = id => document.getElementById(id);
  const palette = ['#4e79a7', '#ed9a3b', '#64a977', '#bc77a2', '#76b7b2', '#ccbd55', '#a7a0cf', '#c8816b'];
  const colors = {none: '#e8edef', overlap: '#368a61', miss: '#e8ae45', selected: '#95b7d0', catalytic: '#7b3f8f'};
  const metricNames = {auprc: 'AUPRC', auprc_enrichment: 'AUPRC enrichment', auroc: 'AUROC'};
  const bundleCache = new Map();
  let manifest, current, currentId = null, viewer, token = 0, selectedIndex = null, hoverLabel = null;
  let atomMap = new Map(), mappedIndices = new Set(), sequenceButtons = [], structureReady = false;

  const node = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const fmt = (value, decimals = 3) => finite(value) ? value.toFixed(decimals) : '—';
  const fmtMetric = (key, value) => key === 'auprc_enrichment' ? (finite(value) ? `${value.toFixed(2)}×` : '—') : fmt(value);
  const residueKey = (chain, resi, icode) => `${chain}|${Number(resi)}|${String(icode || '').trim()}`;
  const indexKey = i => residueKey(current.chain, current.resnums[i], current.icodes?.[i]);
  const proteinIndex = atom => atom.hetflag ? undefined : atomMap.get(residueKey(atom.chain, atom.resi, atom.icode));
  const hasAnnotations = () => Array.isArray(current?.catalytic);
  const mode = () => $('mode').value;
  const continuous = () => mode() === 'localization';
  const displayId = entry => `${entry.pdb_id.toUpperCase()} · chain ${entry.chain}`;
  const residueLabel = i => `${current.seq?.[i] || '?'} ${current.resnums[i]}${current.icodes?.[i] || ''}`;
  // Links use "#1a0i-A" (letters, digits and hyphens only). "#1a0i_A" is accepted too.
  const hashOf = id => id.replace(/_([^_]*)$/, '-$1');
  const entryFromHash = hash => {
    const key = decodeURIComponent((hash || '').replace(/^#/, ''));
    return key ? manifest.proteins.find(p => p.id === key || hashOf(p.id) === key) : undefined;
  };

  async function fetchData(url, type = 'json') {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return type === 'json' ? response.json() : response.text();
  }

  async function fetchBundle(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return JSON.parse(await new Response(stream).text());
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  async function loadEntryData(entry) {
    if (!entry.bundle) {
      return {data: await fetchData(entry.data_url || `proteins/${encodeURIComponent(entry.id)}.json`), pdb: null};
    }
    if (!bundleCache.has(entry.bundle)) {
      bundleCache.set(entry.bundle, fetchBundle(entry.bundle).catch(error => {
        bundleCache.delete(entry.bundle);
        throw error;
      }));
    }
    const record = (await bundleCache.get(entry.bundle))[entry.id];
    if (!record) throw new Error(`No data found for ${entry.id}.`);
    return {data: record.data, pdb: record.pdb};
  }

  function validate(data) {
    if (!Number.isInteger(data.n_res) || data.n_res < 1 || !Array.isArray(data.blobs) || !data.blobs.length) {
      throw new Error('The data for this enzyme is incomplete.');
    }
    for (const field of ['resnums', 'localization_score', 'blob_of_res']) {
      if (!Array.isArray(data[field]) || data[field].length !== data.n_res) throw new Error(`The data for this enzyme is incomplete (${field}).`);
    }
    if (!data.blobs.every(b => Array.isArray(b.residue_indices))) throw new Error('The blob data for this enzyme is incomplete.');
    if (data.catalytic != null && (!Array.isArray(data.catalytic) || data.catalytic.length !== data.n_res)) {
      throw new Error('The catalytic annotations for this enzyme are incomplete.');
    }
  }

  function selectedBlobs() {
    if (!current) return [];
    const blobs = [...current.blobs].sort((a, b) => a.rank - b.rank);
    return $('blob').value === 'topk' ? blobs.slice(0, Number($('topk').value)) : blobs.filter(b => String(b.index) === $('blob').value);
  }

  const activeIndices = () => new Set(selectedBlobs().flatMap(b => b.residue_indices || []));

  function scoreColor(value) {
    if (!finite(value)) return colors.none;
    const t = Math.max(0, Math.min(1, value));
    return `rgb(${Math.round(237 + (177 - 237) * t)},${Math.round(244 + (42 - 244) * t)},${Math.round(245 + (27 - 245) * t)})`;
  }

  function residueColor(i, active) {
    if (continuous()) return scoreColor(current.localization_score?.[i]);
    if (mode() === 'overlap') {
      if (current.catalytic?.[i]) return active.has(i) ? colors.overlap : colors.miss;
      return active.has(i) ? colors.selected : colors.none;
    }
    if (!active.has(i)) return colors.none;
    const chosen = selectedBlobs();
    const owner = chosen.find(b => b.index === current.blob_of_res[i]) || chosen.find(b => (b.residue_indices || []).includes(i));
    return owner ? palette[owner.rank % palette.length] : colors.none;
  }

  function visibleProteins() {
    const query = $('search').value.trim().toLowerCase();
    const heldOutOnly = $('heldout').checked;
    return manifest.proteins.filter(p => (!heldOutOnly || p.held_out)
      && `${p.id} ${p.pdb_id} ${p.chain} ${p.ec || ''} ${p.name || ''}`.toLowerCase().includes(query));
  }

  function compareProteins(a, b) {
    const key = $('sort').value;
    if (key === 'id') return a.id.localeCompare(b.id);
    const va = finite(a.metrics?.[key]) ? a.metrics[key] : -Infinity;
    const vb = finite(b.metrics?.[key]) ? b.metrics[key] : -Infinity;
    return (vb - va) || a.id.localeCompare(b.id);
  }

  function renderList() {
    const proteins = visibleProteins().sort(compareProteins);
    const metric = $('sort').value === 'id' ? 'auprc_enrichment' : $('sort').value;
    const list = $('protein-list');
    list.replaceChildren();
    for (const p of proteins) {
      const button = node('button', 'protein-button');
      button.type = 'button';
      button.dataset.id = p.id;
      button.setAttribute('aria-current', String(currentId === p.id));
      const title = node('span', 'protein-id', displayId(p));
      if (p.held_out) {
        const tag = node('span', 'tag', 'held out');
        tag.title = $('heldout-badge').title;
        title.append(tag);
      }
      button.append(title, node('span', 'protein-name', p.name || `EC ${p.ec || 'unknown'}`),
        node('span', 'protein-stat', `EC ${p.ec || '—'} · ${metricNames[metric]} ${fmtMetric(metric, p.metrics?.[metric])}`));
      button.addEventListener('click', () => loadProtein(p));
      list.append(button);
    }
    const total = manifest.proteins.length;
    $('count').textContent = proteins.length === total ? `${total} enzymes` : `${proteins.length} of ${total} enzymes`;
    if (!proteins.length) list.append(node('p', 'muted empty', 'No enzymes match.'));
  }

  function markCurrent() {
    const list = $('protein-list');
    let selected = null;
    for (const button of list.querySelectorAll('.protein-button')) {
      const isCurrent = button.dataset.id === currentId;
      button.setAttribute('aria-current', String(isCurrent));
      if (isCurrent) selected = button;
    }
    if (!selected) return;
    // Scroll only the list (not the page) so the current enzyme is visible.
    const top = selected.offsetTop - list.offsetTop, left = selected.offsetLeft - list.offsetLeft;
    if (top < list.scrollTop || top + selected.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top - list.clientHeight / 3;
    }
    if (left < list.scrollLeft || left + selected.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = left - 8;
    }
  }

  function renderMetrics() {
    const box = $('metrics');
    box.replaceChildren();
    for (const [key, label] of Object.entries(metricNames)) {
      const card = node('div', 'metric');
      card.append(node('span', '', label), node('strong', '', fmtMetric(key, current.metrics?.[key])));
      box.append(card);
    }
  }

  function describeResidue(i) {
    const ids = current.blobs.filter(b => (b.residue_indices || []).includes(i)).map(b => `B${b.index + 1}`);
    const blobText = ids.length ? `${ids.length > 1 ? 'blobs' : 'blob'} ${ids.join(', ')}` : 'not in any blob';
    $('residue-detail').textContent = `${residueLabel(i)} · residue score ${fmt(current.localization_score?.[i])} · ${blobText}`
      + (current.catalytic?.[i] ? ' · M-CSA catalytic residue' : '');
  }

  function focusResidue(i, zoom = false) {
    selectedIndex = i;
    sequenceButtons.forEach((button, j) => button.classList.toggle('selected', j === i));
    describeResidue(i);
    if (!structureReady) return;
    if (!mappedIndices.has(i)) {
      $('residue-detail').textContent += ' · no coordinates in the structure';
      return;
    }
    if (hoverLabel) viewer.removeLabel(hoverLabel);
    const selector = {predicate: atom => proteinIndex(atom) === i};
    hoverLabel = viewer.addLabel(residueLabel(i), {fontSize: 12, backgroundColor: '#173940', fontColor: 'white', backgroundOpacity: 0.85}, selector);
    if (zoom) viewer.zoomTo(selector, 350);
    viewer.render();
  }

  function renderSequence(active) {
    const fragment = document.createDocumentFragment();
    sequenceButtons = [];
    for (let i = 0; i < current.n_res; i++) {
      const button = node('button', 'residue', current.seq?.[i] || '?');
      button.type = 'button';
      button.style.backgroundColor = residueColor(i, active);
      button.style.color = continuous() && current.localization_score?.[i] > 0.6 ? 'white' : '#173940';
      button.classList.toggle('cat', Boolean(current.catalytic?.[i]) && $('annotations').checked);
      button.classList.toggle('selected', i === selectedIndex);
      button.title = `${residueLabel(i)} · residue score ${fmt(current.localization_score?.[i])}${current.catalytic?.[i] ? ' · catalytic' : ''}`;
      button.setAttribute('aria-label', button.title);
      button.addEventListener('mouseenter', () => focusResidue(i));
      button.addEventListener('focus', () => focusResidue(i));
      button.addEventListener('click', () => focusResidue(i, true));
      fragment.append(button);
      sequenceButtons.push(button);
      if ((i + 1) % 10 === 0) fragment.append(node('span', 'residue-gap'));
    }
    $('sequence').replaceChildren(fragment);
  }

  function renderLegend(active) {
    const legend = $('legend');
    legend.replaceChildren();
    const item = (label, color) => {
      const el = node('span', 'legend-item');
      const swatch = node('span', 'swatch');
      swatch.style.backgroundColor = color;
      el.append(swatch, document.createTextNode(label));
      legend.append(el);
    };
    if (continuous()) {
      legend.append(node('span', '', 'Residue score 0'), node('span', 'gradient'), node('span', '', '1'));
      $('reading-note').textContent = "Each residue's highest membership in any blob. The metrics above use this score.";
    } else if (mode() === 'overlap') {
      item('Catalytic, inside selected blobs', colors.overlap);
      item('Catalytic, outside selected blobs', colors.miss);
      item('Other residues in selected blobs', colors.selected);
      $('reading-note').textContent = 'Green: catalytic residues inside the selected blobs. Orange: catalytic residues outside them. Blue: other residues in the selected blobs.';
    } else {
      selectedBlobs().forEach(b => item(`B${b.index + 1} · attention ${fmt(b.attention)}`, palette[b.rank % palette.length]));
      $('reading-note').textContent = 'Colors show the selected blobs, ranked by attention.';
    }
    if (hasAnnotations() && $('annotations').checked && mode() !== 'overlap') item('Catalytic residues (sticks)', colors.catalytic);
    const ncat = hasAnnotations() ? current.catalytic.filter(Boolean).length : 0;
    const hit = [...active].filter(i => current.catalytic?.[i]).length;
    $('coverage').textContent = continuous()
      ? `${current.n_res} residues · ${ncat} catalytic`
      : `Selected blobs: ${active.size} of ${current.n_res} residues · ${hit} of ${ncat} catalytic`;
  }

  function recolor() {
    if (!current) return;
    const active = activeIndices();
    $('topk').disabled = continuous() || $('blob').value !== 'topk';
    $('blob').disabled = continuous();
    renderLegend(active);
    renderSequence(active);
    if (!structureReady) return;
    viewer.setStyle({}, {});
    viewer.setStyle({hetflag: false}, {cartoon: {color: colors.none}});
    viewer.setStyle({predicate: atom => proteinIndex(atom) !== undefined}, {cartoon: {colorfunc: atom => residueColor(proteinIndex(atom), active)}});
    if (hasAnnotations() && $('annotations').checked) {
      const stick = mode() === 'overlap'
        ? {radius: 0.2, colorfunc: atom => residueColor(proteinIndex(atom), active)}
        : {radius: 0.2, color: colors.catalytic};
      viewer.addStyle({predicate: atom => Boolean(current.catalytic[proteinIndex(atom)])}, {stick});
    }
    viewer.render();
  }

  async function loadProtein(entry) {
    if (!entry) return;
    const request = ++token;
    currentId = entry.id;
    structureReady = false;
    current = null;
    selectedIndex = null;
    atomMap = new Map();
    mappedIndices = new Set();
    if (viewer) { viewer.clear(); viewer.render(); }
    hoverLabel = null;
    markCurrent();
    $('status').textContent = `Loading ${displayId(entry)}…`;
    $('structure-error').hidden = true;
    $('protein-title').textContent = displayId(entry);
    $('heldout-badge').hidden = !entry.held_out;
    for (const id of ['protein-description', 'coverage', 'reading-note']) $(id).textContent = '';
    for (const id of ['sequence', 'metrics', 'legend']) $(id).replaceChildren();
    $('residue-detail').textContent = 'Loading residues…';
    try {
      const {data, pdb: bundledPdb} = await loadEntryData(entry);
      if (request !== token) return;
      validate(data);
      current = data;
      $('annotations').disabled = !hasAnnotations();
      $('mode').querySelector('[value=overlap]').disabled = !hasAnnotations();
      if (!hasAnnotations() && mode() === 'overlap') $('mode').value = 'identity';
      $('protein-description').textContent = `${current.name || 'Enzyme'} · EC ${current.ec || 'unknown'} · ${current.n_res} residues`;
      $('topk').max = current.blobs.length;
      $('topk').value = Math.min(Number($('topk').value), current.blobs.length);
      $('topk-value').textContent = $('topk').value;
      $('blob').replaceChildren(new Option('Top blobs by attention', 'topk'));
      [...current.blobs].sort((a, b) => a.rank - b.rank)
        .forEach(b => $('blob').append(new Option(`B${b.index + 1} · attention rank ${b.rank + 1}`, String(b.index))));
      renderMetrics();
      recolor();
      $('residue-detail').textContent = 'Select a residue to see its score and blobs.';
      for (let i = 0; i < current.n_res; i++) atomMap.set(indexKey(i), i);
      history.replaceState(null, '', `#${hashOf(current.id)}`);
      if (!viewer) throw new Error('The 3D view needs WebGL, which is turned off in this browser.');
      if (!bundledPdb && !current.structure_url) throw new Error('No structure file is available for this enzyme.');
      const pdb = bundledPdb ?? await fetchData(current.structure_url, 'text');
      if (request !== token) return;
      const model = viewer.addModel(pdb, 'pdb');
      const atoms = model.selectedAtoms({});
      if (!atoms.length) throw new Error('The structure file has no readable atoms.');
      mappedIndices = new Set(atoms.map(atom => proteinIndex(atom)).filter(i => i !== undefined));
      structureReady = true;
      viewer.setHoverable({predicate: atom => proteinIndex(atom) !== undefined}, true,
        atom => { const i = proteinIndex(atom); if (i !== undefined) focusResidue(i); }, () => {});
      viewer.setClickable({predicate: atom => proteinIndex(atom) !== undefined}, true, atom => {
        const i = proteinIndex(atom);
        if (i !== undefined) { focusResidue(i); sequenceButtons[i]?.scrollIntoView({block: 'nearest'}); }
      });
      recolor();
      viewer.zoomTo();
      viewer.render();
      $('status').textContent = '';
      const missing = current.n_res - mappedIndices.size;
      if (missing > 0) {
        $('structure-error').textContent = `${missing} residues have no coordinates in this structure. Their scores still appear in the sequence.`;
        $('structure-error').hidden = false;
      }
    } catch (error) {
      if (request !== token) return;
      $('status').textContent = current ? 'The 3D structure could not be shown.' : 'This enzyme could not be loaded.';
      $('structure-error').textContent = error.message;
      $('structure-error').hidden = false;
    }
  }

  async function boot() {
    try {
      if (window.$3Dmol) {
        try { viewer = $3Dmol.createViewer($('viewer'), {backgroundColor: 'white', antialias: true}); } catch (error) { console.error(error); }
      }
      manifest = await fetchData('manifest.json');
      if (!Array.isArray(manifest.proteins) || !manifest.proteins.length) throw new Error('the enzyme list is empty');
      const topK = Number(manifest.top_k_default);
      if (Number.isInteger(topK) && topK > 0) { $('topk').value = topK; $('topk-value').textContent = topK; }
      $('search').addEventListener('input', renderList);
      $('sort').addEventListener('change', renderList);
      $('heldout').addEventListener('change', renderList);
      ['mode', 'blob', 'annotations'].forEach(id => $(id).addEventListener('change', recolor));
      $('topk').addEventListener('input', () => { $('topk-value').textContent = $('topk').value; recolor(); });
      $('reset').addEventListener('click', () => { if (viewer && structureReady) { viewer.zoomTo(); viewer.render(); } });
      window.addEventListener('resize', () => { if (viewer) { viewer.resize(); viewer.render(); } });
      window.addEventListener('hashchange', () => {
        const entry = entryFromHash(location.hash);
        if (entry && entry.id !== currentId) loadProtein(entry);
      });
      renderList();
      await loadProtein(entryFromHash(location.hash) || [...manifest.proteins].sort(compareProteins)[0]);
    } catch (error) {
      $('status').textContent = `The enzyme list could not be loaded (${error.message}). Reload the page to try again.`;
      $('count').textContent = '';
    }
  }

  boot();
})();
