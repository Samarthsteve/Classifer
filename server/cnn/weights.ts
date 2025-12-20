// Pre-trained LeNet CNN weights from convnet_weights.js
// Converted to TypeScript for CNN processing

export interface CNNWeights {
  conv1Filters: number[][][];
  conv1Biases: number[];
  conv2Filters: number[][][][];
  conv2Biases: number[];
  fc1Weights: number[][];
  fc1Biases: number[];
  fc2Weights: number[][];
  fc2Biases: number[];
  outputWeights: number[][];
  outputBiases: number[];
  keepers: number[][];
}

// Simplified weight initialization - will be populated with actual weights
export const getPretrainedWeights = (): CNNWeights => {
  return {
    conv1Filters: [],
    conv1Biases: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    conv2Filters: [],
    conv2Biases: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    fc1Weights: [],
    fc1Biases: [],
    fc2Weights: [],
    fc2Biases: [],
    outputWeights: [],
    outputBiases: Array(10).fill(0.0),
    keepers: [
      [1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1],
      [1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1],
      [0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
      [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    ],
  };
};
