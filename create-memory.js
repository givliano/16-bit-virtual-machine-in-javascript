const createMemory = sizeInBytes => {
  // creates and arrayBuffer of the length
  const arrayBuffer = new ArrayBuffer(sizeInBytes);
  // read and write values of different sized
  const dataView = new DataView(arrayBuffer);
  return dataView;
}

module.exports = createMemory;
