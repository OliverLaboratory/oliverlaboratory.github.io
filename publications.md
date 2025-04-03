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
</style>
</head>

<h5>* = equal contribution</h5>
<h5>' = co-corresponding</h5>

<table class="publications-table">
  <tr>
    <td><img src="/assets/rnamigos2.png" class="pub-img" alt="RNAmigos2"></td>
    <td><b>RNAmigos2: accelerated structure-based RNA virtual screening with deep graph learning</b><br>
    Juan G. Carvajal Patiño*, Vincent Mallet*, David Becerra, L. Fernando Niño V, Carlos Oliver', Jerome Waldispuhl'<br>
    <i>Nature Communications 2025</i> (<a href="https://www.biorxiv.org/content/10.1101/2023.11.23.568394v3">preprint</a>) (<a href="https://www.nature.com/articles/s41467-025-57852-0">article</a>)</td>
  </tr>
</table>
