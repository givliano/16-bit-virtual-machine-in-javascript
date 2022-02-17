const eraseScreen = () => {
  process.stdout.write('\x1b[2J');
};

const moveTo = (x, y) => {
  // escape code to the terminal, which will move the cursor of the terminal
  // it starts with 1, which should be added
  process.stdout.write(`\x1b[${y};${x}H`);
};

const setBold = () => {
  process.stdout.write('\x1b[1m');
};

const setRegular = () => {
  process.stdout.write('\x1b[0m');
};

const createScreenDevice = () => {
  return {
    getUint16: () => 0,
    getUint8: () => 0,
    setUint16: (address, data) => {
      // escape sequences
      const command = (data & 0xff00) >> 8;
      // gets numerical value, as in `A` is 0x41 (65)
      const characterValue = data & 0x00ff;

      if (command === 0xff) {
        eraseScreen();
      } else if (command === 0x01) {
        setBold();
      } else if (command === 0x02) {
        setRegular();
      }

      // formula for mapping an array in a 16x16 grid
      const x = (address % 16) + 1;
      const y = Math.floor(address / 16) + 1;
      moveTo(x * 2, y); // 2 to make it a quare9
      const character = String.fromCharCode(characterValue);
      process.stdout.write(character);
    }
  }
};

module.exports = createScreenDevice;
