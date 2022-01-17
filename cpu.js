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

  // get the instruction that is being pointed to by the ip register
  fetch() {
    const nextInstructionAddress = this.getRegister('ip');
    const instruction = this.memory.getUint8(nextInstructionAddress); // get 8 bit value
    this.setRegister('ip', nextInstructionAddress + 1);
    return instruction;
  }

  fetch16() {
    const nextInstructionAddress = this.getRegister('ip');
    const instruction = this.memory.getUint16(nextInstructionAddress); // get 16 bit value
    this.setRegister('ip', nextInstructionAddress + 2);
    return instruction;
  }

  execute(instruction) {
    switch(instruction) {
      // move literal into r1 register
      case 0x10: {
        const literal = this.fetch16();
        this.setRegister('r1', literal);
        return;
      }
      // move literal into r2 register
      case 0x11: {
        const literal = this.fetch16();
        this.setRegister('r2', literal);
        return;
      }
      // add register to register
      case 0x12: {
        const r1 = this.fetch();
        const r2 = this.fetch();
        const registerValue1 = this.register.getUint16(r1 * 2);
        const registerValue2 = this.register.getUint16(r2 * 2);
        this.setRegister('acc', registerValue1 + registerValue2);
        return;
      }
    }
  }

  step() {
    const instruction = this.fetch();
    return this.execute(instruction);
  }
}

module.exports = CPU;
