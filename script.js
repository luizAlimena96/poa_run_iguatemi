let chart;
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

async function createChart() {
    allData = await fetchData();
    updateChart();
}

function updateChart() {
    const categorySelect = document.getElementById('categorySelect');
    const category = categorySelect.value;
    const distance = parseFloat(categorySelect.selectedOptions[0].dataset.distance);
    const categoryData = allData[category] || [];

    const chartData = categoryData.map(row => {
        const timeInMinutes = convertTimeToMinutes(row.Tempo);
        const pace = calculatePace(timeInMinutes, distance);
        return { x: timeInMinutes, y: pace, number: row.Número };
    });

    const ctx = document.getElementById('scatterChart').getContext('2d');

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
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Tempo Total (Minutos)' },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)',
                        lineWidth: 1,
                    },
                    ticks: {
                        stepSize: 5
                    }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Pace (min/km)' },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)',
                        lineWidth: 1,
                    },
                    ticks: {
                        stepSize: 0.5
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
                        label: function(context) {
                            return `Tempo: ${context.raw.x} min, Pace: ${context.raw.y.toFixed(2)} min/km`;
                        }
                    }
                }
            }
        }
    });
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

createChart();
