const MOV_LIT_REG = 0x10;
const MOV_REG_REG = 0x11;
const MOV_REG_MEM = 0x12;
const ADD_MEM_REG = 0x13;
const ADD_REG_REG = 0x14;
// jump if not equal: compares a literal value to the accumulator register
// and jumps to the supplied address if the values are not equal.
const JMP_NOT_EQ  = 0x15;

module.exports = {
  MOV_LIT_REG,
  MOV_REG_REG,
  MOV_REG_MEM,
  ADD_MEM_REG,
  ADD_REG_REG,
  JMP_NOT_EQ
};
