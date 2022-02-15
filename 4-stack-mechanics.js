const readline = require('readline');
const createMemory = require('./create-memory');
const CPU = require('./cpu');
const instructions = require('./instructions');
const { syncBuiltinESMExports } = require('module');

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

// serves as the assembly label
const subroutineAddress = 0x3000;
let i = 0; // incrementing pointer

///////////// PROGRAM /////////////
//
// psh 0x3333
// psh 0x2222
// psh 0x1111
//
// mov 0x1234, r1
// mov 0x5678, r4
//
// psh 0x0000
// cal my_subroutine:
// psh 0x4444
//
// SUBROUTINE
// at address 0x3000
// my_subroutine:
// psh 0x0102
// psh 0x0304
// psh 0x0506
//
// mov 0x0708, r1
// mov 0x090A, r8
// ret
//
// psh 0x3333
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x33;
writableBytes[i++] = 0x33;

// psh 0x2222
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x22;
writableBytes[i++] = 0x22;

// psh 0x1111
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x11;
writableBytes[i++] = 0x11;

// mov 0x1234, r1
writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x12;
writableBytes[i++] = 0x34;
writableBytes[i++] = R1;

// mov 0x5678, r4
writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x56;
writableBytes[i++] = 0x78;
writableBytes[i++] = R4;

// psh 0x0000
// indicates no arguments in the subroutine
writableBytes[i++] = instructions.PSH;
writableBytes[i++] = 0x00
writableBytes[i++] = 0x00

// using bit shift and masks to isolate the top
// and bottom parts of the address
// cal my_subroutine:
writableBytes[i++] = instructions.CAL_LIT;
writableBytes[i++] = (subroutineAddress & 0xff00) >> 8;
writableBytes[i++] = (subroutineAddress & 0x00ff);

// psh 0x4444
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x44;
writableBytes[i++] = 0x44;

// subroutine
i = subroutineAddress;

// psh 0x0102
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x02;

// psh 0x0304
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x03;
writableBytes[i++] = 0x04;

// psh 0x0506
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x05;
writableBytes[i++] = 0x06;

// mov 0x0708, r1
writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x07;
writableBytes[i++] = 0x08;
writableBytes[i++] = R1;

// mov 0x090A, r8
writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x09;
writableBytes[i++] = 0x01;
writableBytes[i++] = R8;

// ret
writableBytes[i++] = instructions.RET;
///////// END OF PROGRAM //////////

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister('ip'));
cpu.viewMemoryAt(0xffff - 1 - 42, 44);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', () => {
  cpu.step();
  cpu.debug();
  cpu.viewMemoryAt(cpu.getRegister('ip'));
  cpu.viewMemoryAt(0xffff - 1 - 42, 44);
});
