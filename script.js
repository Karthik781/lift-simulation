class LiftSystem {
    constructor(floors, lifts) {
        this.floors = floors;
        this.lifts = lifts;
        this.liftPositions = new Array(lifts).fill(0);
        this.liftStates = new Array(lifts).fill('idle');
    }

    moveLift(liftIndex, targetFloor) {
        const currentPosition = this.liftPositions[liftIndex];
        this.liftPositions[liftIndex] = targetFloor;
        
        const liftElement = document.querySelectorAll('.lift')[liftIndex];
        const floorHeight = 81; // Height of each floor (80px) + 1px for border
        const travelDistance = Math.abs(targetFloor - currentPosition);
        const travelTime = travelDistance * 2; // 2 seconds per floor

        this.liftStates[liftIndex] = 'moving';

        // Close doors at current floor
        this.closeDoors(liftElement);

        // Wait for doors to close, then move the lift
        setTimeout(() => {
            liftElement.style.transition = `transform ${travelTime}s linear`;
            liftElement.style.transform = `translateY(${-targetFloor * floorHeight}px)`;

            // Wait for lift to arrive at destination, then open doors
            setTimeout(() => {
                this.openDoors(liftElement);
                
                // Keep doors open for 3 seconds, then close them
                setTimeout(() => {
                    this.closeDoors(liftElement);
                    this.liftStates[liftIndex] = 'idle';
                }, 3000);
            }, travelTime * 1000);
        }, 1000);
    }

    openDoors(liftElement) {
        const leftDoor = liftElement.querySelector('.lift-door.left');
        const rightDoor = liftElement.querySelector('.lift-door.right');
        const liftNumber = liftElement.querySelector('.lift-number');
        leftDoor.classList.add('open');
        rightDoor.classList.add('open');
        liftNumber.style.display = 'none'; // Hide lift number when doors are open
    }

    closeDoors(liftElement) {
        const leftDoor = liftElement.querySelector('.lift-door.left');
        const rightDoor = liftElement.querySelector('.lift-door.right');
        const liftNumber = liftElement.querySelector('.lift-number');
        leftDoor.classList.remove('open');
        rightDoor.classList.remove('open');
        liftNumber.style.display = 'block'; // Show lift number when doors are closed
    }

    findNearestLift(targetFloor) {
        return this.liftPositions.reduce((nearest, position, index) => {
            if (this.liftStates[index] !== 'idle') return nearest;
            const distance = Math.abs(position - targetFloor);
            if (distance < Math.abs(this.liftPositions[nearest] - targetFloor) || this.liftStates[nearest] !== 'idle') {
                return index;
            }
            return nearest;
        }, 0);
    }

    callLift(targetFloor, direction) {
        const nearestLift = this.findNearestLift(targetFloor);
        if (this.liftStates[nearestLift] === 'idle') {
            this.moveLift(nearestLift, targetFloor);
        }
        // TODO: Implement logic for handling direction
    }
}

function generateSimulation() {
    const floors = parseInt(document.getElementById('floors').value);
    const lifts = parseInt(document.getElementById('lifts').value);
    const simulation = document.getElementById('simulation');
    simulation.innerHTML = '';

    const building = document.createElement('div');
    building.className = 'building';

    const liftsContainer = document.createElement('div');
    liftsContainer.className = 'lifts-container';

    for (let i = 0; i < floors; i++) {
        const floor = document.createElement('div');
        floor.className = 'floor';
        
        if (i === 0) {
            // Bottom floor: only up button
            const upButton = createButton('↑', () => liftSystem.callLift(i, 'up'));
            floor.appendChild(upButton);
        } else if (i === floors - 1) {
            // Top floor: only down button
            const downButton = createButton('↓', () => liftSystem.callLift(i, 'down'));
            floor.appendChild(downButton);
        } else {
            // Middle floors: both up and down buttons
            const upButton = createButton('↑', () => liftSystem.callLift(i, 'up'));
            const downButton = createButton('↓', () => liftSystem.callLift(i, 'down'));
            floor.appendChild(upButton);
            floor.appendChild(downButton);
        }

        const floorLabel = document.createElement('span');
        floorLabel.textContent = `Floor ${i}`;
        floor.appendChild(floorLabel);

        building.appendChild(floor);
    }

    for (let i = 0; i < lifts; i++) {
        const lift = document.createElement('div');
        lift.className = 'lift';
        lift.innerHTML = `
            <div class="lift-door left"></div>
            <div class="lift-door right"></div>
            <span class="lift-number">L${i + 1}</span>
        `;
        lift.style.right = `${10 + i * 60}px`;
        lift.style.zIndex = lifts - i;
        liftsContainer.appendChild(lift);
    }

    simulation.appendChild(building);
    building.appendChild(liftsContainer);

    liftSystem = new LiftSystem(floors, lifts);
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.className = 'floor-button';
    button.textContent = text;
    button.onclick = onClick;
    return button;
}

let liftSystem;
document.getElementById('generate').addEventListener('click', generateSimulation);