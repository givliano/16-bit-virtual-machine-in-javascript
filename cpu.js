const createMemory = require('./crete-memory');

// this class is the heart of the VM
// 16 bits CPU, so each register will be 16 bits wide
class CPU {
  constructor(memory) {
    this.memory = memory;

    // names of the registers
    this.registerNames = [
      // instruction pointer, also called program counter
      'ip',
      // accumulator, for the result of mathematical expressions 'accumulate values'
      'acc',
      // general purpose registers
      'r1', 'r2', 'r3', 'r4',
      'r5', 'r6', 'r7', 'r8'
    ];

    // create memory with length of registerNamers multiplied by 2 (2 bytes) for the registers
    this.registers = createMemory(this.registerNames.length * 2)

    // maps the name to a byte offset
    // an actual map (object) linking the name to a number
    // which is the byte offset in the buffer for the register
    this.registerMap = this.registerNames.reduce((map, name, i) => {
      // sets a map with the name of the register and a memory value
      // so we can access the register memory by a name
      map[name] = i * 2;
      return map;
    }, {}); // initial value

  }

  getRegister(name) {
    if (!(name in this.registerMap)) {
      throw new Error(`getRegister: No such register ${name}`);
    }
    // return the 16 bit value we find at the memory location
    // so the place in the buffer for the register (0, 2, 4, 6 byte offset etc)
    return this.registers.getUint16(this.registerMap[name]);
  }

  setRegister(name, value) {
    if (!(name in this.registerMap)) {
      throw new Error(`setRegister: No such register ${name}`);
    }
    return this.register.setUint16(this.registerMap(name), value);
  }
}

module.exports = CPU;
