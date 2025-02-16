document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const rides = Array.isArray(data) ? data : [data];
            
            const completedRides = rides.filter(ride => 
                ride.city === 'Ahmedabad' && 
                ride.status === 'completed' && 
                ride.request_time.startsWith('2024')
            );

            const shuffledRides = [...completedRides].sort(() => Math.random() - 0.5);
            const grid = document.getElementById('grid');
            grid.innerHTML = '';

            shuffledRides.forEach((ride, index) => {
                const distance = parseFloat(ride.distance);
                const fare = parseFloat(ride.fare_amount);
                const productType = ride.product_type || 'UberGo';
                const requestTime = new Date(ride.request_time);
                const formattedTime = requestTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const hour = requestTime.getHours();

                // Determine surge and demand based on time
                let surgeMultiplier = 1.0;
                let demandLevel = 'Normal';
                
                if (hour >= 8 && hour <= 10) {  // Morning rush
                    surgeMultiplier = 1.8;
                    demandLevel = 'Very High';
                } else if (hour >= 17 && hour <= 19) {  // Evening rush
                    surgeMultiplier = 1.6;
                    demandLevel = 'High';
                } else if (hour >= 22 || hour <= 4) {  // Late night
                    surgeMultiplier = 1.4;
                    demandLevel = 'Moderate';
                }

                // Alternate between different heights
                const heights = [200, 240, 280];
                const height = heights[index % 3];

                let timeClass;
                if (hour >= 5 && hour < 12) {
                    timeClass = 'morning';
                } else if (hour >= 12 && hour < 18) {
                    timeClass = 'evening';
                } else {
                    timeClass = 'night';
                }

                const width = 250;

                const card = document.createElement('div');
                card.className = `ride-card ${timeClass}`;
                card.style.width = `${width}px`;
                card.style.height = `${height}px`;

                const perKmRate = (fare / distance).toFixed(2);

                card.innerHTML = `
                    <div class="product-type">${productType}</div>
                    <div class="time-overlay">${formattedTime}</div>
                    <div class="per-km-rate">
                        <p class="label">Per KM Rate</p>
                        <p class="value">₹${perKmRate}</p>
                    </div>
                    ${surgeMultiplier > 1 ? `<div class="surge-indicator">${surgeMultiplier}x Surge</div>` : ''}
                    ${demandLevel !== 'Normal' ? `<div class="demand-badge">${demandLevel} Demand</div>` : ''}
                    <div class="ride-info">
                        <div class="metric">
                            <p class="label">Distance</p>
                            <p class="value">${distance.toFixed(2)} <span class="unit">km</span></p>
                        </div>
                        <div class="metric">
                            <p class="label">Fare</p>
                            <p class="value">₹${fare.toFixed(2)}</p>
                        </div>
                    </div>
                `;

                grid.appendChild(card);
            });
        })
        .catch(error => console.error('Error loading the JSON data:', error));
});

