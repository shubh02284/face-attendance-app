import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

let modelsLoaded = false;

export const loadFaceModels = async () => {
  if (modelsLoaded) return true;

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
  return true;
};

export { faceapi };