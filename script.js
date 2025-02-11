let chart;
let barChart;
let allData;

async function fetchData() {
    try {
        const response = await fetch('./iguatemi_run_data.json');
        if (!response.ok) throw new Error('Erro ao carregar JSON');
        return await response.json();
    } catch (error) {
        alert('Erro ao carregar dados: ' + error.message);
        console.error(error);
        return {};
    }
}

function convertTimeToMinutes(time) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
}

function calculatePace(timeInMinutes, distance) {
    return timeInMinutes / distance;
}

async function createCharts() {
    allData = await fetchData();
    updateScatterChart();
    updateBarChart();
}

function updateScatterChart() {
    const ctx = document.getElementById('scatterChart').getContext('2d');
    const { categoryData, distance } = getCategoryData();

    const chartData = categoryData.map(row => {
        const time = convertTimeToMinutes(row.Tempo);
        const pace = calculatePace(time, distance);
        return { x: time, y: pace, number: row.Número };
    });

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: `Pace vs Tempo (${distance} km)`,
                data: chartData,
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', title: { display: true, text: 'Tempo Total (Minutos)' }},
                y: { title: { display: true, text: 'Pace (min/km)' }}
            }
        }
    });
}

function updateBarChart() {
    const ctx = document.getElementById('barChart').getContext('2d');
    const { categoryData } = getCategoryData();
    const times = categoryData.map(row => Math.round(convertTimeToMinutes(row.Tempo)));
    const binSize = 5;

    const minTime = Math.floor(Math.min(...times) / binSize) * binSize;
    const maxTime = Math.ceil(Math.max(...times) / binSize) * binSize;

    const bins = Array.from(
        { length: (maxTime - minTime) / binSize + 1 },
        (_, i) => minTime + i * binSize
    );

    const counts = bins.map((bin, index) =>
        times.filter(time =>
            time >= bin && time < (bins[index + 1] || maxTime + binSize)
        ).length
    );

    if (barChart) barChart.destroy();

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.map(bin => `${bin} - ${bin + binSize - 1} min`),
            datasets: [{
                label: 'Participantes por Faixa de Tempo',
                data: counts,
                backgroundColor: 'rgba(0, 200, 150, 0.5)',
                borderColor: 'rgba(0, 150, 100, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Participantes'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tempo (Minutos)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            return `${label}: ${context.raw} participantes`;
                        }
                    }
                }
            }
        }
    });
}


function getCategoryData() {
    const categorySelect = document.getElementById('categorySelect');
    const category = categorySelect.value;
    const distance = parseFloat(categorySelect.selectedOptions[0].dataset.distance);
    const categoryData = allData[category] || [];
    return { categoryData, distance };
}

function highlightParticipant() {
    const participantNumber = parseInt(document.getElementById('participantNumber').value);
    if (isNaN(participantNumber)) return alert("Digite um número válido!");

    const dataset = chart.data.datasets[0];
    const point = dataset.data.find(d => d.number === participantNumber);

    if (point) {
        const pace = point.y.toFixed(2);
        const time = point.x.toFixed(2);

        document.getElementById('info').innerText = 
            `Participante: ${participantNumber} | Tempo: ${time} minutos | Pace: ${pace} min/km`;

        dataset.pointBackgroundColor = dataset.data.map(d =>
            d.number === participantNumber ? 'red' : 'rgba(0, 123, 255, 0.5)'
        );

        chart.update();
    } else {
        document.getElementById('info').innerText = '';
        alert("Número não encontrado!");
    }
}

createCharts();
