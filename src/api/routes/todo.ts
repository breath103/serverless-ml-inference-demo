import { Namespace, Parameter, Route } from "@serverless-seoul/corgi";
import { Type } from "@serverless-seoul/typebox";

const tfjs = require("@tensorflow/tfjs");
// const BodyPixNet = require("@tensorflow-models/body-pix");
const MobileNet = require("@tensorflow-models/mobilenet");
require('@tensorflow/tfjs-backend-wasm');

import Axios from "axios";
import * as sharp from "sharp";

// const modelPromise = BodyPixNet.load({
//   architecture: "ResNet50",
//   outputStride: 16,
//   quantBytes: 2,
// });
const mobileNetModelPromise = MobileNet.load();

export const route = new Namespace(
  "/ml-inference", {}, {
    children: [
      Route.GET(
        "", {
          desc: "list all todo lists", operationId: "listTodoLists"
        }, {
          url: Parameter.Query(Type.String()),
        }, async function() {
          const url = this.params.url;

          console.log(await tfjs.setBackend("wasm"));

          const imgBuffer = (await Axios.get(url, { responseType: "arraybuffer" })).data;
          const sharpImg = sharp(imgBuffer);
          const imgSize = await sharpImg.metadata();

          const rawBuffer = await sharpImg.raw().toBuffer();
          const imgTensor = tfjs.tensor3d(
            Uint8Array.from(rawBuffer), [imgSize.height!, imgSize.width!, 3],
          );
          const res = await (await mobileNetModelPromise).classify(imgTensor, 4);

          return this.json({ data: res }, 200);
        }),
    ]
  });
