const createMemory = require('./create-memory');
const instructions = require('./instructions');

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
      'r5', 'r6', 'r7', 'r8',
      // stack pointer and frame pointer
      'sp', 'fp'
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

     // we need two bytes to store a 16bit value, so we need this one
     // and the second one because we are dealing with a zero based index.
     // so it starts in the end (0xffff) and you can store 2 bytes
     this.setRegister('sp', memory.byteLength - 1 - 1)

     this.stackFrameSize = 0;
  }

  debug() {
    this.registerNames.forEach(name => {
      console.log(`${name}:  0x${this.getRegister(name).toString(16).padStart(4, '0')}`)
    });
    console.log();
  }

  // argument n how many bytes we see further back in the stack
  viewMemoryAt(address, n = 8) {
    // format is: address: byte found at the address, followedby 7 bytes that come after that
    // 0x0F01: 0x04 0x05 0A3 0xFE 0x13 0x0D 0x44 0x0F ...
    const nextNBytes = Array.from({ length: n }, (_, i) =>
      this.memory.getUint8(address + i)
    ).map(v => `0x${v.toString(16).padStart(2, '0')}`)

    console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextEightBytes.join(' ')}`);
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
    return this.registers.setUint16(this.registerMap[name], value);
  }

  // get the instruction that is being pointed to by the ip register
  // in the memory of the CPU (not to be confused by the register)
  fetch() {
    const nextInstructionAddress = this.getRegister('ip');
    console.log(`IN FETCH`);
    console.log(`next instruction address: ${nextInstructionAddress}`);
    const instruction = this.memory.getUint8(nextInstructionAddress); // get 8 bit value
    console.log(`memory`);
    console.log(this.memory);
    console.log(`instruction: ${instruction}`);
    this.setRegister('ip', nextInstructionAddress + 1);
    console.log('registers');
    console.log(this.registers);
    return instruction;
  }

  fetch16() {
    const nextInstructionAddress = this.getRegister('ip');
    console.log(`IN FETCH 16`);
    console.log(`next instruction address: ${nextInstructionAddress}`);
    const instruction = this.memory.getUint16(nextInstructionAddress); // get 16 bit value
    console.log(`memory`);
    console.log(this.memory);
    console.log(`instruction: ${instruction}`);
    this.setRegister('ip', nextInstructionAddress + 2);
    console.log('registers');
    console.log(this.registers);
    return instruction;
  }

  // takes a value and handles the mechanical parts of the stack
  push(value) {
    const spAddress = this.getRegister('sp');
    this.memory.setUint16(spAddress, value);
    // we need to decrement it by two to go up the stack
    this.setRegister('sp', spAddress - 2);
    this.stackFrameSize += 2;
  }

  // to get the last value we must increment the stack pointer since it was decreased after push
  pop() {
     const nextSpAddress = this.getRegister('sp' ) + 2;
     this.setRegister('sp', nextSpAddress);
     this.stackFrameSize -= 2;
     return this.memory.getUint16(nextSpAddress);
  }

  pushState() {
    this.push(this.getRegister('r1'));
    this.push(this.getRegister('r2'));
    this.push(this.getRegister('r3'));
    this.push(this.getRegister('r4'));
    this.push(this.getRegister('r5'));
    this.push(this.getRegister('r6'));
    this.push(this.getRegister('r7'));
    this.push(this.getRegister('r8'));
    this.push(this.getRegister('ip'));
    // this operation also takes up stack space
    this.push(this.stackFrameSize + 2);
    this.setRegister('fp', this.getRegister('sp'));
    this.stackFrameSize = 0;
  }

  popState() {
    // get the address inside the frame pointer
    const framePointerAddress = this.getRegister('fp');
    this.setRegister('sp', framePointerAddress);

    this.stackFrameSize = this.pop();
    const stackFrameSize = this.stackFrameSize;

    this.setRegister('ip', this.pop());
    this.setRegister('r8', this.pop());
    this.setRegister('r7', this.pop());
    this.setRegister('r6', this.pop());
    this.setRegister('r5', this.pop());
    this.setRegister('r4', this.pop());
    this.setRegister('r3', this.pop());
    this.setRegister('r2', this.pop());
    this.setRegister('r1', this.pop());

    // gets the stack size
    // minute 13 in class 4 for future ref
    const nArgs = this.pop();
    for (let i = 0; i < nArgs; i++) {
      this.pop();
    }

    this.setRegister('fp', framePointerAddress + stackFrameSize);
  }

  fetchRegisterIndex() {
    return (this.fetch() % this.registerNames.length) * 2;
  }

  execute(instruction) {
    switch(instruction) {
      // move literal into register
      case instructions.MOV_LIT_REG: {
        const literal = this.fetch16();
        const register = this.fetchRegisterIndex();
        this.registers.setUint16(register, literal);
        return;
      }

      // move register to register
      case instructions.MOV_REG_REG: {
        const registerFrom = this.fetchRegisterIndex();
        const registerTo = this.fetchRegisterIndex();
        const value = this.registers.getUint16(registerFrom);
        this.registers.setUint16(registerTo, value);
        return;
      }

      // move register to memory
      case instructions.MOV_REG_MEM: {
        const registerFrom = this.fetchRegisterIndex();
        const address = this.fetch16();
        const value = this.registers.getUint16(registerFrom);
        this.memory.setUint16(address, value);
        return;
      }

      // move memory to register
      case  instructions.MOV_MEM_REG: {
        const address = this.fetch16();
        const registerTo = this.fetchRegisterIndex();
        const value = this.memory.getUint16(address);
        this.registers.setUint16(registerTo, value);
        return;
      }

      // add register to register
      case instructions.ADD_REG_REG: {
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const registerValue1 = this.registers.getUint16(r1);
        const registerValue2 = this.register.getUint16(r2);
        this.setRegister('acc', registerValue1 + registerValue2);
        return;
      }

      // jump if not equal
      case instructions.JMP_NOT_EQ: {
        const value = this.fetch16()
        const address = this.fetch16();

        if (value !== this.getRegister('acc')) {
          this.setRegister('ip', address);
        }

        return;
      }

      // push literal into stack
      case instructions.PSH_LIT: {
        const value = this.fetch16();
        this.push(value);
        return;
      }

      // push register into stack
      case instructions.PSH_REG: {
        const registerIndex = this.fetchRegisterIndex();
        this.push(this.registers.getUint16(registerIndex));
        return;
      }

      // pop from the stack
      case instructions.POP: {
        const registerIndex = this.fetchRegisterIndex();
        const value = this.pop();
        this.registers.setUint16(registerIndex, value);
        return;
      }

      // call a literal
      case instructions.CAL_LIT: {
        const address = this.fetch16();
        console.log(`cal_lit address: ${address}`)
        this.pushState();
        this.setRegister('ip', address);
      }

      // call a register
      case instructions.CAL_REG: {
        // fetch the register index that holds the address
        const registerIndex = this.fetchRegisterIndex();
        console.log(`cal_reg register index: ${registerIndex}`);
        const address = this.registers.getUint16(registerIndex);
        console.log(`cal_reg address: ${address}`);
        this.pushState();
        this.setRegister('ip', address);
      }

      // return from subroutine
      case instructions.RET :{
        this.popState();
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
