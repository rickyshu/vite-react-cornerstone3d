import { useEffect, useState, useRef } from "react"
import { createImageIdsAndCacheMetaData, initDemo } from "./lib"
import { RenderingEngine, Enums, type Types } from "@cornerstonejs/core"

function App() {
  const elementRef = useRef<HTMLDivElement>(null)
  const running = useRef(false)

  useEffect(() => {
    const setup = async () => {
      if (running.current) {
        return
      }
      running.current = true
      await initDemo()

      // Get Cornerstone imageIds and fetch metadata into RAM
      const imageIds = await createImageIdsAndCacheMetaData({
        StudyInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
        SeriesInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
        wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
      })

      // Instantiate a rendering engine
      const renderingEngineId = "myRenderingEngine"
      const renderingEngine = new RenderingEngine(renderingEngineId)

      const viewportId = "CT_STACK"
      const viewportInput = {
        viewportId,
        type: Enums.ViewportType.STACK,
        element: elementRef.current,
        defaultOptions: {
          background: [0.2, 0, 0.2] as Types.RGB,
        },
      }

      renderingEngine.enableElement(viewportInput)

      const viewport = renderingEngine.getViewport(
        viewportId
      ) as Types.IStackViewport

      const stack = [imageIds[0]]

      viewport.setStack(stack)

      viewport.render()
    }

    setup()

    // Create a stack viewport
  }, [elementRef, running])

  return (
    <div
      ref={elementRef}
      style={{
        width: "512px",
        height: "512px",
        backgroundColor: "#000",
      }}
    >
    </div>
  )

}

export default App