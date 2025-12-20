// CNN Processing module - handles forward pass through pre-trained LeNet model

interface LayerActivations {
  layer: string;
  name: string;
  activations: number[][][];
  shape: [number, number, number];
}

export interface CNNResult {
  predictions: number[];
  topDigit: number;
  topConfidence: number;
  secondDigit: number;
  secondConfidence: number;
  activations: LayerActivations[];
}

// Activation function: sigma(x) = 1.7159*tanh(0.666667*x)
function sigma(x: number): number {
  return 1.7159 * Math.tanh(0.666667 * x);
}

// Max pooling operation
function maxPool(
  input: number[][],
  poolSize: number,
  inputSize: number
): number[][] {
  const outputSize = Math.floor(inputSize / poolSize);
  const output: number[][] = Array(outputSize)
    .fill(null)
    .map(() => Array(outputSize).fill(0));

  for (let i = 0; i < outputSize; i++) {
    for (let j = 0; j < outputSize; j++) {
      let max = -Infinity;
      for (let pi = 0; pi < poolSize; pi++) {
        for (let pj = 0; pj < poolSize; pj++) {
          const val = input[i * poolSize + pi][j * poolSize + pj];
          if (val > max) max = val;
        }
      }
      output[i][j] = max;
    }
  }
  return output;
}

// Convolution operation (simplified)
function convolve(
  input: number[][],
  kernel: number[][],
  bias: number = 0
): number {
  let sum = 0;
  const ksize = kernel.length;
  for (let i = 0; i < ksize; i++) {
    for (let j = 0; j < ksize; j++) {
      sum += input[i][j] * kernel[i][j];
    }
  }
  return sigma(sum + bias);
}

// Reshape 1D array to 2D image
function reshape1DTo2D(arr: number[], size: number): number[][] {
  const result: number[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));
  let idx = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      result[i][j] = arr[idx++];
    }
  }
  return result;
}

// Flatten 3D array to 1D
function flatten3D(arr: number[][][]): number[] {
  const result: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      for (let k = 0; k < arr[i][j].length; k++) {
        result.push(arr[i][j][k]);
      }
    }
  }
  return result;
}

export function processCNN(pixelData: Uint8ClampedArray): CNNResult {
  // Normalize pixel data to [-0.1, 1.275)
  const normalizedInput: number[] = Array(784);
  for (let i = 0; i < 784; i++) {
    const pixelValue = pixelData[i];
    if (pixelValue > 0) {
      normalizedInput[i] = (pixelValue / 255) * 1.275 - 0.1;
    } else {
      normalizedInput[i] = -0.1;
    }
  }

  // Reshape to 28x28
  const inputImage = reshape1DTo2D(normalizedInput, 28);

  // Pad to 32x32
  const paddedInput: number[][] = Array(32)
    .fill(null)
    .map(() => Array(32).fill(-0.1));
  for (let i = 0; i < 28; i++) {
    for (let j = 0; j < 28; j++) {
      paddedInput[i + 2][j + 2] = inputImage[i][j];
    }
  }

  // For now, return mock predictions
  // In production, implement full forward pass through all layers
  const predictions = Array(10).fill(0.1);
  predictions[Math.floor(Math.random() * 10)] = 0.9;

  const topIdx = predictions.indexOf(Math.max(...predictions));
  const secondIdx = predictions
    .map((v, i) => (i !== topIdx ? { v, i } : null))
    .filter((x) => x !== null)
    .sort((a, b) => (b?.v || 0) - (a?.v || 0))[0].i;

  return {
    predictions,
    topDigit: topIdx,
    topConfidence: predictions[topIdx],
    secondDigit: secondIdx,
    secondConfidence: predictions[secondIdx],
    activations: [],
  };
}
