import { useEffect, useRef } from "react";
import { getCompleteMediaUrl } from "../utils";

export default function Container({ assets }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pageRef = useRef(1);

  const videoElements = {};

  useEffect(() => {
    if (canvasRef.current) renderAssets();
    // eslint-disable-next-line
  }, [JSON.stringify(assets)]);

  // const drawThumbnail = (video, x, y, WIDTH, HEIGHT) => {
  //   const ctx = canvasRef.current.getContext("2d");
  //   ctx.drawImage(video, x, y, WIDTH, HEIGHT);
  // };

  const drawFrame = (video, x, y, WIDTH, HEIGHT) => {
    if (!video.paused && !video.ended) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(x, y, WIDTH, HEIGHT);  // Clear previous frame
      ctx.drawImage(video, x, y, WIDTH, HEIGHT);  // Draw video at correct position

      requestAnimationFrame(() => drawFrame(video, x, y, WIDTH, HEIGHT));
    }
  };

  const renderAssets = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const COLS = 4;
    const GAP = 10;
    const WIDTH = canvas.width / COLS - GAP;
    const HEIGHT = WIDTH;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // const container = canvas.parentElement;

    canvas.addEventListener("mousemove", (event) => {
      const { offsetX, offsetY } = event;

      Object.values(videoElements)?.forEach(({ video, x, y, WIDTH, HEIGHT, name }) => {
        const isHovering = offsetX >= x && offsetX <= x + WIDTH && offsetY >= y && offsetY <= y + HEIGHT;

        if (isHovering && !videoElements[name]?.isPlaying) {
          video.play();
          videoElements[name].isPlaying = true;
          drawFrame(video, x, y, WIDTH, HEIGHT);
        } else if (!isHovering && videoElements[name]?.isPlaying) {
          video.pause();
          videoElements[name].isPlaying = false;
        }
      });
    });


    assets.forEach((asset, index) => {
      const row = Math.floor(index / COLS);
      const col = index % COLS;
      const x = col * (WIDTH + GAP);
      const y = row * (HEIGHT + GAP);

      if (asset.mimeType.startsWith("image/")) {
        const img = new Image();
        img.src = getCompleteMediaUrl(asset.url);
        img.onload = () => {
          ctx.drawImage(img, x, y, WIDTH, HEIGHT);
        };
      } else {

        if (!videoElements[asset.name]) {
          const video = document.createElement("video");
          video.crossOrigin = "anonymous";
          video.src = getCompleteMediaUrl(asset.url);
          video.preload = "auto";
          video.muted = true;
          video.loop = true;
          // video.play(); // Start playing immediately (hidden)

          videoElements[asset.name] = { video, x, y, WIDTH, HEIGHT, isPlaying: false };

          video.addEventListener("canplay", () => {
            drawFrame(video, x, y, WIDTH, HEIGHT);
          });

          video.addEventListener("error", (e) => {
            console.error("Video error:", asset.name, video.src, e);
          });
          videoElements[asset.name] = { video, x, y, WIDTH, HEIGHT, name: asset.name };
        }


        // NOTE: using video element on top of canvas 
        // const video = document.createElement("video");

        // video.crossOrigin = "anonymous";
        // video.src = getCompleteMediaUrl(asset.url);
        // video.preload = "auto";
        // video.muted = true;
        // video.loop = true;
        // video.playsInline = true;
        // video.style.position = "absolute";
        // video.style.left = `${canvas.offsetLeft + x}px`;
        // video.style.top = `${canvas.offsetTop + y}px`;
        // video.style.width = `${WIDTH}px`;
        // video.style.height = `${HEIGHT}px`;
        // video.style.objectFit = "cover"; // Fit within the grid
        // video.style.zIndex = "10"; // Ensure it appears above the canvas
        // video.style.cursor = "pointer";
        // video.controls = false; // Hide controls

        // video.addEventListener("loadeddata", () => {
        //   ctx.drawImage(video, x, y, WIDTH, HEIGHT);
        // });

        // // Play video on hover
        // video.addEventListener("mouseenter", () => {
        //   video.play();
        // });

        // // Pause video when mouse leaves
        // video.addEventListener("mouseleave", () => {
        //   video.pause();
        //   video.currentTime = 0; // Reset to the start
        // });

        // container.appendChild(video);

        // videoElements[asset.name] = video;
      }
    });

  };


  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      pageRef.current += 1;
      loadMoreAssets();
    }
  };

  const loadMoreAssets = () => {
    console.log("Fetching more assets...");
    // You can implement server-side pagination here
  };

  return (
    <div className="container">
      <h2>Media assets</h2>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ width: "100%", height: "100%", overflowY: "scroll", position: "relative", overflowX:'hidden' }}
      >
        <canvas ref={canvasRef} width={800} height={800} style={{ position: "relative", overflowX:'hidden' }}></canvas>
      </div>
    </div>
  );
}
