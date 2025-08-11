const readings = [
  "Genesis 1",
  "Genesis 2",
  "Genesis 3",
  "Genesis 4",
  // Add the rest of your daily readings
];

function getTodayReading() {
  const startDate = new Date('2025-01-01');
  const today = new Date();
  const dayOfYear = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  return readings[dayOfYear % readings.length];
}

document.getElementById('root').innerHTML = `
  <h1>Today's Bible Reading</h1>
  <p>${getTodayReading()}</p>
`;
