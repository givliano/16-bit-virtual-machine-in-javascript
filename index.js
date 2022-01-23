const readline = require('readline');
const createMemory = require('./create-memory');
const CPU = require('./cpu');
const instructions = require('./instructions');

// constants
const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;
const R3 = 4;
const R4 = 5;
const R5 = 6
const R6 = 7;
const R7 = 8;
const R8 = 9;
const SP = 10;
const FP = 11;

const memory = createMemory(256 * 256);
// create writable Uint8 array
const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);

let i = 0; // incrementing pointer

///////////// PROGRAM /////////////
//
// mov $5151, R1
// mov $4242, R2
//
// psh R1
// psh R2
//
// pop R1
// pop R2
//

writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x51;
writableBytes[i++] = 0x51;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x42;
writableBytes[i++] = 0x42;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.PSH_REG;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.PSH_REG;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.POP;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.POP;
writableBytes[i++] = R2;

///////// END OF PROGRAM //////////

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister('ip'));
cpu.viewMemoryAt(0xffff - 1 - 6);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', () => {
  cpu.step();
  cpu.debug();
  cpu.viewMemoryAt(cpu.getRegister('ip'));
  cpu.viewMemoryAt(0xffff - 1 - 6);
});
