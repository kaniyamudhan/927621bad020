const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;
const windowSize = 10;
let numbers = [];
const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(`http://20.244.56.144/test/${type}`);
        return response.data.numbers;
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error);
        return [];
    }
};
app.use(express.json());
app.get('/numbers/:numberid', async (req, res) => {
    const fetchedNumbers = await fetchNumbers(req.params.numberid);
    let filteredNumbers = [];

    switch (req.params.numberid) {
        case 'p':
            filteredNumbers = fetchedNumbers.filter(isPrime);
            break;
        case 'f':
            filteredNumbers = fetchedNumbers.filter(isFibonacci);
            break;
        case 'e':
            filteredNumbers = fetchedNumbers.filter(isEven);
            break;
        case 'r':
            filteredNumbers = fetchedNumbers;
            break;
        default:
            res.status(400).send('Invalid numberid');
            return;
    }

    filteredNumbers.forEach(number => {
        if (!numbers.includes(number)) {
            numbers.push(number);
            if (numbers.length > windowSize) {
                numbers.shift();
            }
        }
    });

    const average = calculateAverage(numbers);

    const response = {
        windowPrevState: numbers.slice(0, windowSize).join(', '),
        windowCurrState: filteredNumbers.slice(0, windowSize).join(', '),
        numbers: numbers,
        avg: average.toFixed(2)
    };

    res.json(response);
});

function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    let i = 5;
    while (i * i <= num) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
        i += 6;
    }
    return true;
}

function isFibonacci(num) {
    const phi = (1 + Math.sqrt(5)) / 2;
    const a = phi * num;
    return num === 0 || Math.abs(Math.round(a) - a) < 1 / num;
}

function isEven(num) {
    return num % 2 === 0;
}

function calculateAverage(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
