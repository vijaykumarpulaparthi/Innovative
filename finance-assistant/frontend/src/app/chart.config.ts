import { Chart, registerables } from 'chart.js';


// Register Chart.js components
Chart.register(...registerables);


export { Chart };