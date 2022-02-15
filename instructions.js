const MOV_LIT_REG = 0x10;
const MOV_REG_REG = 0x11;
const MOV_REG_MEM = 0x12;
const ADD_MEM_REG = 0x13;
const ADD_REG_REG = 0x14;
// jump if not equal: compares a literal value to the accumulator register
// and jumps to the supplied address if the values are not equal.
const JMP_NOT_EQ  = 0x15;
const PSH_LIT     = 0x17;
const PSH_REG     = 0x18;
const POP         = 0x1A;
const CAL_LIT     = 0x5E; // literal value to specify where in memory the subroutine is
const CAL_REG     = 0x5F; // gets the subroutine address from a register
const RET         = 0x60;
const HLT         = 0xFF;

module.exports = {
  MOV_LIT_REG,
  MOV_REG_REG,
  MOV_REG_MEM,
  ADD_MEM_REG,
  ADD_REG_REG,
  JMP_NOT_EQ,
  PSH_LIT,
  PSH_REG,
  POP,
  CAL_LIT,
  CAL_REG,
  RET,
  HLT
};
