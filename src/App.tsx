import { useEffect, useRef, useState } from "react";
import {
  RenderingEngine,
  Enums,
  volumeLoader,
  cornerstoneStreamingImageVolumeLoader,
  setVolumesForViewports,
} from "@cornerstonejs/core";

import { init as coreInit } from "@cornerstonejs/core";
import { init as csToolsInit } from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
// import createImageIdsAndCacheMetaData from "./lib/createImageIdsAndCacheMetaData";

volumeLoader.registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);

function App() {
  const axialElement = useRef<HTMLDivElement>(null);
  const coronalElment = useRef<HTMLDivElement>(null);
  const sagittalElement = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const [imageIds, setImageIds] = useState<string[]>([]);

  useEffect(() => {
    const setup = async () => {
      if (running.current) {
        return;
      }
      running.current = true;

      await coreInit();
      await csToolsInit();
      await dicomImageLoaderInit({ maxWebWorkers: 1 });

      // const imageIds = await createImageIdsAndCacheMetaData({
      //   StudyInstanceUID:
      //     "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
      //   SeriesInstanceUID:
      //     "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
      //   wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
      // });

      // Instantiate a rendering engine
      const renderingEngineId = "myRenderingEngine";
      const renderingEngine = new RenderingEngine(renderingEngineId);
      const viewportId1 = "CT_AXIAL";
      const viewportId2 = "CT_CHORONAL";
      const viewportId3 = "CT_SAGITTAL";

      const viewportInput = [
        {
          viewportId: viewportId1,
          type: Enums.ViewportType.ORTHOGRAPHIC,
          element: coronalElment.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.AXIAL,
          },
        },
        {
          viewportId: viewportId2,
          type: Enums.ViewportType.ORTHOGRAPHIC,
          element: axialElement.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.CORONAL,
          },
        },
        {
          viewportId: viewportId3,
          type: Enums.ViewportType.ORTHOGRAPHIC,
          element: sagittalElement.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.SAGITTAL,
          },
        },
      ];

      const volumeId = "myVolume";

      const volume = await volumeLoader.createAndCacheVolume(volumeId, {
        imageIds,
      });

      renderingEngine.setViewports(viewportInput);

      // Set the volume to load
      volume.load();

      setVolumesForViewports(
        renderingEngine,
        [{ volumeId }],
        [viewportId1, viewportId2, viewportId3]
      );

      renderingEngine.renderViewports([viewportId1, viewportId2, viewportId3]);
    };

    if (imageIds.length > 0) setup();

    // Create a stack viewport //stack을 만들면 안 되지! => 이것도 확인이 필요하다!
  }, [coronalElment, sagittalElement, axialElement, running, imageIds]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImageIds: string[] = [];
    Array.from(files).forEach((file) => {
      const blobUrl = URL.createObjectURL(file);
      const imageId = `wadouri:${blobUrl}`;
      newImageIds.push(imageId);
    });
    setImageIds(newImageIds);
  };

  // const handleFileUpload = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const files = event.target.files;
  //   if (!files || files.length === 0) return;

  //   const newImageIds: string[] = [];
  //   for (const file of Array.from(files)) {
  //     // File을 Blob으로 변환하여 cornerstone의 imageId 생성
  //     const blobUrl = URL.createObjectURL(file);
  //     const imageId = `wadouri:${blobUrl}`;
  //     newImageIds.push(imageId);
  //   }
  //   setImageIds(newImageIds);
  // };

  return (
    <>
      <input
        type="file"
        multiple
        onChange={handleFileUpload}
        accept=".dcm"
        style={{ marginBottom: "10px" }}
      />
      <div>
        <div
          ref={coronalElment}
          style={{
            width: "512px",
            height: "512px",
            backgroundColor: "#000",
          }}
        ></div>
        <div
          ref={axialElement}
          style={{
            width: "512px",
            height: "512px",
            backgroundColor: "#000",
          }}
        ></div>
        <div
          ref={sagittalElement}
          style={{
            width: "512px",
            height: "512px",
            backgroundColor: "#000",
          }}
        ></div>
      </div>
    </>
  );
}

export default App;
