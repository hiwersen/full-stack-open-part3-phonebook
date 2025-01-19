









const regex = /^\d{2}-\d{6,}$|^\d{3}-\d{5,}$/;

[
    ['09-1234556', true],
    ['09-1234556 ', false],
    ['040-22334455', true],
    ['1234556', false],
    ['1-22334455', false],
    ['10-22-334455', false]
].forEach(([n, b]) => console.log(regex.test(n) === b))

