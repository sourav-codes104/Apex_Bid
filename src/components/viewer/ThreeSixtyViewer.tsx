import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture, Sphere } from "@react-three/drei";
import { Loader2, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThreeSixtyViewerProps {
  imageUrl: string;
  className?: string;
}

const PanoramaSphere = ({ imageUrl }: { imageUrl: string }) => {
  const texture = useTexture(imageUrl);
  
  return (
    <Sphere args={[500, 60, 40]} scale={[-1, 1, 1]}>
      <meshBasicMaterial map={texture} side={2} />
    </Sphere>
  );
};

const LoadingFallback = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-muted">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
      <p className="text-sm text-muted-foreground">Loading 360° View...</p>
    </div>
  </div>
);

const ThreeSixtyViewer = ({ imageUrl, className = "" }: ThreeSixtyViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  const handleReset = () => {
    setKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-background"
    : `relative aspect-video rounded-lg overflow-hidden ${className}`;

  return (
    <div className={containerClass}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas key={key} camera={{ fov: 75, position: [0, 0, 0.1] }}>
          <ambientLight intensity={1} />
          <PanoramaSphere imageUrl={imageUrl} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={0.1}
            maxDistance={100}
            rotateSpeed={-0.3}
            zoomSpeed={0.5}
          />
        </Canvas>
      </Suspense>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="bg-background/80 backdrop-blur-sm"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="bg-background/80 backdrop-blur-sm"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Hint */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
        Drag to look around • Scroll to zoom
      </div>

      {/* Close button for fullscreen */}
      {isFullscreen && (
        <Button
          variant="secondary"
          className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
          onClick={toggleFullscreen}
        >
          <Minimize2 className="h-4 w-4 mr-2" />
          Exit Fullscreen
        </Button>
      )}
    </div>
  );
};

export default ThreeSixtyViewer;
