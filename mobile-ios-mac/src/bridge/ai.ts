import * as tf from '@tensorflow/tfjs';

export type Projection = {
  slope: number;
  intercept: number;
  r2: number;
  predictKgOnDate: (d: Date) => number;
  estimateDateForKg: (targetKg: number) => Date | null;
};

export function fitLinear(
  dateIsoAndKg: { dateISO: string; weightKg: number }[],
): Projection | null {
  if (dateIsoAndKg.length < 3) return null;

  const xs = dateIsoAndKg.map((r) => new Date(r.dateISO).getTime());
  const minX = Math.min(...xs);
  const normX = xs.map((x) => (x - minX) / (1000 * 60 * 60 * 24)); // days since first entry
  const ys = dateIsoAndKg.map((r) => r.weightKg);

  const x = tf.tensor1d(normX);
  const y = tf.tensor1d(ys);
  const ones = tf.onesLike(x);
  const X = tf.stack([x, ones], 1);

  // Solve least squares: beta = (X^T X)^-1 X^T y
  const XT = X.transpose();
  const beta = tf.linalg
    .pinv(XT.matMul(X))
    .matMul(XT)
    .matMul(y.reshape([-1, 1]));
  const slope = beta.arraySync()[0][0];
  const intercept = beta.arraySync()[1][0];

  // r^2 quick calc
  const yPred = X.matMul(beta).reshape([-1]);
  const ssRes = y.sub(yPred).square().sum().arraySync() as number;
  const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
  const ssTot = ys.reduce((a, b) => a + (b - yMean) * (b - yMean), 0);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  const predictKgOnDate = (d: Date) => {
    const days = (d.getTime() - minX) / (1000 * 60 * 60 * 24);
    return slope * days + intercept;
  };

  const estimateDateForKg = (targetKg: number) => {
    if (Math.abs(slope) < 1e-6) return null;
    const days = (targetKg - intercept) / slope;
    const ms = minX + days * 24 * 60 * 60 * 1000;
    return new Date(ms);
  };

  return { slope, intercept, r2, predictKgOnDate, estimateDateForKg };
}
