// Graph page module
import { $, $all } from '../dom.js';

// Graph page content
export function getGraphPageContent() {
    return `
        <!-- Graph Page Content -->
        <section class="graph-page-section">
            <div class="container">
                <h1 class="page-title">Graph my results</h1>
                <p class="page-subtitle">Visualize your health data</p>
                
                <!-- Excel-like table/grid -->
                <div class="results-table-container">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th class="table-header">
                                    Biomarker<br>
                                    <span class="reference-range-text">Reference range (min - max)</span>
                                </th>
                                <th class="table-header">Result 1</th>
                                <th class="table-header">Result 2</th>
                                <th class="table-header">Result 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="table-cell section-header" colspan="4">Hormones</td>
                            </tr>
                            <tr>
                                <td class="table-cell">Total Testosterone (TT)<br><span class="reference-range-text">nmol/L (15 - 30)</span></td>
                                <td class="table-cell">22.4</td>
                                <td class="table-cell">21.8</td>
                                <td class="table-cell">17.3</td>
                            </tr>
                            <tr>
                                <td class="table-cell">Free Testosterone (FT)<br><span class="reference-range-text">mmol/L (0.225 - 0.700)</span></td>
                                <td class="table-cell">0.481</td>
                                <td class="table-cell">0.465</td>
                                <td class="table-cell">0.39</td>
                            </tr>
                            <tr>
                                <td class="table-cell">Oestradial (E2)<br><span class="reference-range-text">pmol/L (41 - 159)</span></td>
                                <td class="table-cell">124</td>
                                <td class="table-cell">118</td>
                                <td class="table-cell">142</td>
                            </tr>
                            <tr>
                                <td class="table-cell">Leutenising Hormone (LH)<br><span class="reference-range-text">IU/L (1.7 - 8.6)</span></td>
                                <td class="table-cell">4.5</td>
                                <td class="table-cell">4.2</td>
                                <td class="table-cell">4.8</td>
                            </tr>
                            <tr>
                                <td class="table-cell">Folicle Stimulating Hormone (FSH)<br><span class="reference-range-text">IU/L (1.5 - 12.499)</span></td>
                                <td class="table-cell out-of-range">0.92 <span class="reference-range-text">(-0.58)</span></td>
                                <td class="table-cell">1.6</td>
                                <td class="table-cell">2.1</td>
                            </tr>
                            <tr>
                                <td class="table-cell">Sex Hormone Binding Globulin (SHBG)<br><span class="reference-range-text">nmol/L (18 - 39.99)</span></td>
                                <td class="table-cell">39</td>
                                <td class="table-cell">41</td>
                                <td class="table-cell">38</td>
                            </tr>
                            <tr>
                                <td class="table-cell">Prolactin (PRL)<br><span class="reference-range-text">mU/L (86 - 324)</span></td>
                                <td class="table-cell">285</td>
                                <td class="table-cell">276</td>
                                <td class="table-cell">295</td>
                            </tr>
                            <tr>
                                <td class="table-cell section-header" colspan="4">Full Blood Count</td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                            <tr>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                                <td class="table-cell"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="chart-container">
                    <h3 class="chart-title">Hormone Trends Over Time</h3>
                    <canvas id="hormoneChart" width="400" height="200"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3 class="chart-title">Free Testosterone & SHBG Trends</h3>
                    <canvas id="ftShbgChart" width="400" height="200"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3 class="chart-title">LH, FSH & Prolactin Trends</h3>
                    <canvas id="lhpChart" width="400" height="200"></canvas>
                </div>
            </div>
        </section>
    `;
}

// Graph page initialization
export function initializeGraphPage() {
    // Create hormone trend chart
    const ctx = document.getElementById('hormoneChart');
    if (ctx) {
        const hormoneChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Test 1', 'Test 2', 'Test 3'],
                datasets: [
                    {
                        label: 'Total Testosterone (TT)',
                        data: [22.4, 21.8, 17.3],
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 4,
                        pointBackgroundColor: 'rgb(54, 162, 235)',
                        pointBorderColor: 'white',
                        pointBorderWidth: 3,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        tension: 0.1,
                        z: 10,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Oestradial (E2)',
                        data: [124, 118, 142],
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 4,
                        pointBackgroundColor: 'rgb(255, 99, 132)',
                        pointBorderColor: 'white',
                        pointBorderWidth: 3,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        tension: 0.1,
                        z: 10,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Total Testosterone Levels Over Time'
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: 50,
                        title: {
                            display: true,
                            text: 'Total Testosterone (nmol/L)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 300,
                        title: {
                            display: true,
                            text: 'Oestradial (pmol/L)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Test Period'
                        }
                    }
                },
                plugins: {
                    annotation: {
                        annotations: {}
                    }
                }
            }
        });
    }
    
    // Create FT & SHBG chart
    const ftShbgCtx = document.getElementById('ftShbgChart');
    if (ftShbgCtx) {
        const ftShbgChart = new Chart(ftShbgCtx, {
            type: 'line',
            data: {
                labels: ['Test 1', 'Test 2', 'Test 3'],
                datasets: [
                    {
                        label: 'SHBG',
                        data: [39, 41, 38],
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        borderWidth: 4,
                        pointBackgroundColor: 'rgb(75, 192, 192)',
                        pointBorderColor: 'white',
                        pointBorderWidth: 3,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        tension: 0.1,
                        z: 10,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Free Testosterone (FT)',
                        data: [0.481, 0.465, 0.39],
                        borderColor: 'rgb(255, 159, 64)',
                        backgroundColor: 'rgba(255, 159, 64, 0.1)',
                        borderWidth: 4,
                        pointBackgroundColor: 'rgb(255, 159, 64)',
                        pointBorderColor: 'white',
                        pointBorderWidth: 3,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        tension: 0.1,
                        z: 10,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Free Testosterone & SHBG Levels Over Time'
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: 70,
                        title: {
                            display: true,
                            text: 'SHBG (nmol/L)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 2,
                        title: {
                            display: true,
                            text: 'Free Testosterone (mmol/L)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Test Period'
                        }
                    }
                }
            }
        });
    }
    
    // Create LH, FSH & PRL chart
    const lhpCtx = document.getElementById('lhpChart');
    if (lhpCtx) {
        const lhpChart = new Chart(lhpCtx, {
            type: 'line',
            data: {
                labels: ['Test 1', 'Test 2', 'Test 3'],
                datasets: [
                    {
                        label: 'LH',
                        data: [4.5, 4.2, 4.8],
                        borderColor: 'rgb(153, 102, 255)',
                        backgroundColor: 'rgba(153, 102, 255, 0.1)',
                        borderWidth: 4,
                        pointBackgroundColor: 'rgb(153, 102, 255)',
                        pointBorderColor: 'white',
                        pointBorderWidth: 3,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        tension: 0.1,
                        z: 10,
                        yAxisID: 'y'
                    },
                    {
                        label: 'FSH',
                        data: [0.92, 1.6, 2.1],
                        borderColor: 'rgb(255, 205, 86)',
                        backgroundColor: 'rgba(255, 205, 86, 0.1)',
                        borderWidth: 4,
                        pointBackgroundColor: 'rgb(255, 205, 86)',
                        pointBorderColor: 'white',
                        pointBorderWidth: 3,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        tension: 0.1,
                        z: 10,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Prolactin (PRL)',
                        data: [285, 276, 295],
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 4,
                        pointBackgroundColor: 'rgb(255, 99, 132)',
                        pointBorderColor: 'white',
                        pointBorderWidth: 3,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        tension: 0.1,
                        z: 10,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'LH, FSH & Prolactin Levels Over Time'
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: 12,
                        title: {
                            display: true,
                            text: 'LH & FSH (IU/L)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 1000,
                        title: {
                            display: true,
                            text: 'Prolactin (mU/L)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Test Period'
                        }
                    }
                }
            }
        });
    }
    
    console.log('Graph page initialized');
} 