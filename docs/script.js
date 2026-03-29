document.addEventListener("DOMContentLoaded", () => {

    // ===== ELEMENTOS =====
    const seq1Input = document.getElementById("seq1");
    const seq2Input = document.getElementById("seq2");

    const file1Input = document.getElementById("file1");
    const file2Input = document.getElementById("file2");

    const titleInput = document.getElementById("title");
    const xlabelInput = document.getElementById("xlabel");
    const ylabelInput = document.getElementById("ylabel");

    const windowInput = document.getElementById("window");
    const stringencyInput = document.getElementById("stringency");

    const generateBtn = document.getElementById("generate-btn");
    const downloadBtn = document.getElementById("download-btn");

    // ===== FASTA LOADER =====
    function loadFasta(fileInput, targetTextarea) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {
            const lines = e.target.result.split("\n");

            const sequence = lines
                .filter(line => !line.startsWith(">"))
                .join("")
                .trim();

            targetTextarea.value = sequence;
        };

        reader.readAsText(file);
    }

    file1Input.addEventListener("change", () => {
        loadFasta(file1Input, seq1Input);
    });

    file2Input.addEventListener("change", () => {
        loadFasta(file2Input, seq2Input);
    });

    // ===== DOTPLOT LOGIC =====
    function generateDotplot(seq1, seq2, windowSize, stringency) {
        seq1 = seq1.toUpperCase().replace(/\s/g, "");
        seq2 = seq2.toUpperCase().replace(/\s/g, "");

        const x = [];
        const y = [];

        const len1 = seq1.length;
        const len2 = seq2.length;

        for (let i = 0; i <= len1 - windowSize; i++) {
            const window1 = seq1.slice(i, i + windowSize);

            for (let j = 0; j <= len2 - windowSize; j++) {
                const window2 = seq2.slice(j, j + windowSize);

                let matches = 0;

                for (let k = 0; k < windowSize; k++) {
                    if (window1[k] === window2[k]) {
                        matches++;
                    }
                }

                if (matches >= stringency) {
                    x.push(i);
                    y.push(j);
                }
            }
        }

        return { x, y, len1, len2 };
    }

    // ===== GENERAR PLOT =====
    function handleGenerate() {
        const seq1 = seq1Input.value;
        const seq2 = seq2Input.value;

        const windowSize = parseInt(windowInput.value);
        const stringency = parseInt(stringencyInput.value);

        let title = titleInput.value.trim();
        let xlabel = xlabelInput.value.trim();
        let ylabel = ylabelInput.value.trim();

        // Validaciones (igual que PyQt)
        if (!seq1 || !seq2) {
            alert("Both sequences must be provided.");
            return;
        }

        if (stringency > windowSize) {
            alert("Stringency cannot be higher than the window size.");
            return;
        }

        if (!title) title = "DotPlot";
        if (!xlabel) xlabel = "Sequence 1";
        if (!ylabel) ylabel = "Sequence 2";

        const result = generateDotplot(seq1, seq2, windowSize, stringency);

        Plotly.newPlot("plot", [
            {
                x: result.x,
                y: result.y,
                mode: "markers",
                type: "scatter",
                marker: {
                    size: 3,
                    color: "black"
                }
            }
        ], {
            title: title,
            xaxis: {
                title: xlabel,
                range: [0, result.len1]
            },
            yaxis: {
                title: ylabel,
                range: [0, result.len2]
            },
            margin: { t: 50 }
        });
    }

    // ===== DESCARGAR =====
    function handleDownload() {
        Plotly.downloadImage("plot", {
            format: "png",
            filename: "dotplot"
        });
    }

    // ===== EVENTOS =====
    generateBtn.addEventListener("click", handleGenerate);
    downloadBtn.addEventListener("click", handleDownload);

});