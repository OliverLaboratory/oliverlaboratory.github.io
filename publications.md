---
layout: page
title: "Publications"
permalink: /publications
nav: true
order: 3
---

<head>
<style>
/* General table styling */
.publications-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11pt;
}

/* Image styling */
.pub-img {
    width: 180px; /* Fixed width for consistency */
    height: 120px; /* Fixed height for consistency */
    object-fit: cover; /* Scales images proportionally */
    border: 1px solid #787878; /* Subtle border */
    border-radius: 5px; /* Rounded corners */
}

/* Table cell styling */
td {
    padding: 15px; /* Spacing for readability */
    vertical-align: top; /* Align text to top */
}

/* Bold titles */
b {
    font-size: 12pt;
}


/* Responsive design for mobile */
@media (max-width: 600px) {
    .publications-table tr {
        display: block; /* Stack rows vertically */
        margin-bottom: 20px; /* Space between entries */
    }
    .publications-table td {
        display: block; /* Stack cells vertically */
        width: 100%; /* Full width on mobile */
        padding: 10px; /* Adjust padding */
    }
    .pub-img {
        width: 150px; /* Slightly smaller on mobile */
        height: 100px;
        margin: 0 auto; /* Center image */
        display: block;
    }
}

/* Topic filter and pills */
.topic-filter {
    margin: 15px 0 20px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.topic-filter button {
    padding: 4px 12px;
    border: 1px solid #aaa;
    background: #fff;
    border-radius: 14px;
    cursor: pointer;
    font-size: 10pt;
    font-family: inherit;
}
.topic-filter button:hover { background: #f0f0f0; }
.topic-filter button.active {
    background: #333;
    color: #fff;
    border-color: #333;
}
.topic-pills { margin-top: 6px; }
.topic-pill {
    display: inline-block;
    padding: 2px 8px;
    margin: 2px 4px 2px 0;
    font-size: 9pt;
    border-radius: 10px;
    background: #e8e8e8;
    color: #333;
}
.topic-pill[data-topic="rna-sf"] { background: #d4edda; color: #155724; }
.topic-pill[data-topic="protein-sf"] { background: #cce5ff; color: #004085; }
.topic-pill[data-topic="protein-dyn"] { background: #e2d4f2; color: #4a235a; }
.topic-pill[data-topic="graphs"] { background: #ffe0b2; color: #6a3500; }
.topic-pill[data-topic="benchmarks"] { background: #fff3cd; color: #856404; }
.topic-pill[data-topic="drug"] { background: #f8d7da; color: #721c24; }
.topic-pill[data-topic="motif"] { background: #d1ecf1; color: #0c5460; }
</style>
</head>

This is a list of papers published since starting the lab in January 2025. For a full list of my publications go <a href="https://carlosoliver.co/publications">here</a>.

<h5>* = equal contribution</h5>
<h5>' = co-corresponding</h5>

<div class="topic-filter">
    <button class="active" data-topic="all">All</button>
    <button data-topic="rna-sf">RNA Structure-Function</button>
    <button data-topic="protein-sf">Protein Structure-Function</button>
    <button data-topic="protein-dyn">Protein Dynamics</button>
    <button data-topic="graphs">Graphs</button>
    <button data-topic="benchmarks">Benchmarks</button>
    <button data-topic="drug">Drug Discovery</button>
    <button data-topic="motif">Motif Mining</button>
</div>

<h3>Journal</h3>
<table class="publications-table">
  <tr data-topics="protein-sf graphs">
    <td><img src="/assets/pst.png" class="pub-img" alt="Endowing protein language models"></td>
    <td><b>Endowing protein language models with structural knowledge</b><br>
    Philip Hartout*, Dexiong Chen*, Paolo Pellizzoni, Carlos Oliver, Karsten Borgwardt<br>
    <i>Bioinformatics, 41(11):btaf582, 2025</i> (<a href="https://arxiv.org/abs/2401.14819">preprint</a>) (<a href="https://academic.oup.com/bioinformatics/article/41/11/btaf582/8305579">article</a>)
    <div class="topic-pills">
      <span class="topic-pill" data-topic="protein-sf">Protein Structure-Function</span>
      <span class="topic-pill" data-topic="graphs">Graphs</span>
    </div></td>
  </tr>
  <tr data-topics="rna-sf drug graphs">
    <td><img src="/assets/rnamigos2.png" class="pub-img" alt="RNAmigos2"></td>
    <td><b>RNAmigos2: accelerated structure-based RNA virtual screening with deep graph learning</b><br>
    Juan G. Carvajal Patiño*, Vincent Mallet*, David Becerra, L. Fernando Niño V, Carlos Oliver', Jerome Waldispuhl'<br>
    <i>Nature Communications 2025</i> (<a href="https://www.biorxiv.org/content/10.1101/2023.11.23.568394v3">preprint</a>) (<a href="https://www.nature.com/articles/s41467-025-57852-0">article</a>)
    <div class="topic-pills">
      <span class="topic-pill" data-topic="rna-sf">RNA Structure-Function</span>
      <span class="topic-pill" data-topic="drug">Drug Discovery</span>
      <span class="topic-pill" data-topic="graphs">Graphs</span>
    </div></td>
  </tr>
</table>

<h3>Perspectives</h3>
<table class="publications-table">
  <tr data-topics="rna-sf drug">
    <td><img src="/assets/rna_rev.png" class="pub-img" alt="rev"></td>
    <td><b>What's so hard about RNA-targeting drug discovery?</b><br>
    Carlos Oliver, Jerome Waldispuhl<br>
    <i>Nature Computational Science, 2025</i> (<a href="https://www.nature.com/articles/s43588-025-00853-2">article</a>)
    <div class="topic-pills">
      <span class="topic-pill" data-topic="rna-sf">RNA Structure-Function</span>
      <span class="topic-pill" data-topic="drug">Drug Discovery</span>
    </div></td>
  </tr>
</table>

<h3>Reviews</h3>
<table class="publications-table">
  <tr data-topics="rna-sf drug">
    <td><img src="/assets/rna_drug_design_fig1a.png" class="pub-img" alt="RNA drug design"></td>
    <td><b>Machine learning for RNA-targeting drug design</b><br>
    Wissam Karroucha, Carlos Oliver, Veronique Stoven, Vincent Mallet<br>
    <i>Journal of Chemical Information and Modeling (in revision), 2025</i> (<a href="https://arxiv.org/abs/2512.15645">preprint</a>)
    <div class="topic-pills">
      <span class="topic-pill" data-topic="rna-sf">RNA Structure-Function</span>
      <span class="topic-pill" data-topic="drug">Drug Discovery</span>
    </div></td>
  </tr>
</table>

<h3>Workshop</h3>
<table class="publications-table">
  <tr data-topics="protein-sf motif">
    <td><img src="/assets/blobs.png" class="pub-img" alt="BioBlobs"></td>
    <td><b>BioBlobs: Unsupervised Discovery of Functional Substructures for Protein Function Prediction</b><br>
    Xin (Allen) Wang, Kaiwen Shi, Carlos Oliver<br>
    <i>Workshop on Machine Learning for Structural Biology, 2025 (Accepted)</i> (<a href="https://arxiv.org/abs/2510.01632">preprint</a>)
    <div class="topic-pills">
      <span class="topic-pill" data-topic="protein-sf">Protein Structure-Function</span>
      <span class="topic-pill" data-topic="motif">Motif Mining</span>
    </div></td>
  </tr>
  <tr data-topics="rna-sf benchmarks">
    <td><img src="/assets/rnaglibtask.png" class="pub-img" alt="RNA 3D Structure-Function benchmark"></td>
    <td><b>A Comprehensive Benchmark for RNA 3D Structure-Function Modeling</b><br>
    Luis Wyss*, Vincent Mallet*, Wissam Karroucha, Karsten Borgwardt', Carlos Oliver'<br>
    <i>ICLR 2025 Workshop on AI for Nucleic Acids</i> (<a href="https://arxiv.org/abs/2503.21681">preprint</a>)
    <div class="topic-pills">
      <span class="topic-pill" data-topic="rna-sf">RNA Structure-Function</span>
      <span class="topic-pill" data-topic="benchmarks">Benchmarks</span>
    </div></td>
  </tr>
</table>

<h3>Preprints</h3>
<table class="publications-table">
  <tr data-topics="protein-dyn">
    <td><img src="/assets/ensembits.png" class="pub-img" alt="ENSEMBITS"></td>
    <td><b>ENSEMBITS: an alphabet of protein conformational ensembles</b><br>
    Kaiwen Shi, Carlos Oliver<br>
    <i>Submitted, NeurIPS 2026</i> (<a href="https://arxiv.org/abs/2605.13789">preprint</a>)
    <div class="topic-pills">
      <span class="topic-pill" data-topic="protein-dyn">Protein Dynamics</span>
    </div></td>
  </tr>
  <tr data-topics="protein-sf motif">
    <td><img src="/assets/blobs.png" class="pub-img" alt="BioBlobs"></td>
    <td><b>BioBlobs: Unsupervised Discovery of Functional Substructures for Protein Function Prediction</b><br>
    Xin (Allen) Wang, Kaiwen Shi, Carlos Oliver<br>
    <i>Submitted, NeurIPS 2026</i> (<a href="https://arxiv.org/abs/2510.01632">preprint</a>)
    <div class="topic-pills">
      <span class="topic-pill" data-topic="protein-sf">Protein Structure-Function</span>
      <span class="topic-pill" data-topic="motif">Motif Mining</span>
    </div></td>
  </tr>
</table>

<script>
(function() {
  function applyFilter(topic) {
    document.querySelectorAll('.topic-filter button').forEach(b => {
      b.classList.toggle('active', b.dataset.topic === topic);
    });
    document.querySelectorAll('.publications-table tr').forEach(tr => {
      if (topic === 'all') {
        tr.style.display = '';
      } else {
        var topics = (tr.dataset.topics || '').split(/\s+/);
        tr.style.display = topics.indexOf(topic) >= 0 ? '' : 'none';
      }
    });
    document.querySelectorAll('h3').forEach(h => {
      var next = h.nextElementSibling;
      if (!next || !next.classList.contains('publications-table')) return;
      var visible = Array.from(next.querySelectorAll('tr')).some(tr => tr.style.display !== 'none');
      h.style.display = visible ? '' : 'none';
      next.style.display = visible ? '' : 'none';
    });
  }
  document.querySelectorAll('.topic-filter button').forEach(btn => {
    btn.addEventListener('click', function() { applyFilter(btn.dataset.topic); });
  });
})();
</script>
