let chart;
let barChart;

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
    const times = categoryData.map(row => convertTimeToMinutes(row.Tempo));

    const bins = Array.from({ length: 10 }, (_, i) => i * 5);
    const counts = bins.map((bin, index) =>
        times.filter(time => time >= bin && time < bins[index + 1]).length
    );

    if (barChart) barChart.destroy();

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.map(bin => `${bin} - ${bin + 5} min`),
            datasets: [{
                label: 'Participantes por Faixa de Tempo',
                data: counts,
                backgroundColor: 'rgba(0, 200, 150, 0.5)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
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

createCharts();
