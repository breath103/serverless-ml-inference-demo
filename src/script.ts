// import * as BodyPixNet from "@tensorflow-models/body-pix";
// import * as tfjs from "@tensorflow/tfjs";
// const BodyPixNet = require("@tensorflow-models/body-pix");
const MobileNet = require("@tensorflow-models/mobilenet");

const tfjs = require("@tensorflow/tfjs");

require('@tensorflow/tfjs-backend-wasm');

import Axios from "axios";
import * as sharp from "sharp";

async function main() {
  console.log(await tfjs.setBackend("wasm"));

  // const model = await BodyPixNet.load({
  //   architecture: "ResNet50",
  //   outputStride: 16,
  //   quantBytes: 2,
  // });
  const mobileNetModel = await MobileNet.load();


  const url = "https://i.pinimg.com/originals/5c/3d/53/5c3d534e1da759cc449a691490771af6.jpg";
  const imgBuffer = (await Axios.get(url, { responseType: "arraybuffer" })).data;
  const sharpImg = sharp(imgBuffer);
  const imgSize = await sharpImg.metadata();

  const rawBuffer = await sharpImg.raw().toBuffer();
  console.log("XXX: ", rawBuffer);
  console.log(Uint8Array.from(rawBuffer));
  const imgTensor = tfjs.tensor3d(
    Uint8Array.from(rawBuffer), [imgSize.height!, imgSize.width!, 3],
  );
  imgTensor.print();
  console.log(imgTensor);
  // // const imgTensor = tsjs.node.decodeImage(imgArrayBuffer);
  // // const model = await modelPromise;
  console.time("START");
  const res = await mobileNetModel.classify(imgTensor, 8);
  // const res = await model.segmentPerson(imgTensor);
  console.timeEnd("START");
  console.log("RES : ", res);
}

main().then(console.log, (e) => {
  console.error("Error : ", e);
});