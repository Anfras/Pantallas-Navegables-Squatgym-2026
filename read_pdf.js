const fs = require('fs'); const pdf = require('pdf-parse'); let dataBuffer = fs.readFileSync('TPI - Consigna-2026.pdf'); pdf(dataBuffer).then(function(data) { console.log(data.text); });
