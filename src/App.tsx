import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { Play, X, Volume2, VolumeX, Maximize2, Globe, ChevronUp, ExternalLink } from "lucide-react";
//import { Button } from "@/components/ui/button";

interface VideoCardProps {
  thumbnailUrl: string;
  videoUrl: string;
  websiteUrl: string;
  title: string;
  description: string;
  domain: string;
  onOpen: (videoUrl: string, websiteUrl: string, title: string) => void;
}

function VideoCard({ thumbnailUrl, title, description, domain, onOpen, videoUrl, websiteUrl }: VideoCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto bg-black border border-zinc-800 rounded-xl overflow-hidden mb-6">
      {/* Video thumbnail / player area */}
      <div 
        className="relative aspect-video bg-zinc-900 cursor-pointer group"
        onClick={() => onOpen(videoUrl, websiteUrl, title)}
      >
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
        
        {/* Website link preview overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-8">
          <div className="flex items-center gap-2 text-zinc-300 text-sm">
            <Globe className="w-4 h-4" />
            <span>{domain}</span>
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
        <p className="text-zinc-400 text-sm mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <ExternalLink className="w-3 h-3" />
            <span>Click video to open split-screen experience</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SplitScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  websiteUrl: string;
  title: string;
}

function SplitScreenModal({ isOpen, onClose, videoUrl, websiteUrl, title }: SplitScreenModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [splitPosition, setSplitPosition] = useState(35); // percentage for video section
  const [isDragging, setIsDragging] = useState(false);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    const newPosition = splitPosition + (info.delta.y / window.innerHeight) * 100;
    setSplitPosition(Math.max(20, Math.min(60, newPosition)));
  }, [splitPosition]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    setIsDragging(false);
    // Snap to positions based on velocity
    if (info.velocity.y > 500) {
      setSplitPosition(20); // collapsed video
    } else if (info.velocity.y < -500) {
      setSplitPosition(50); // expanded video
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black"
        >
          {/* Close button */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top section - Video */}
          <motion.div 
            className="w-full bg-black relative"
            style={{ height: `${splitPosition}%` }}
            animate={{ height: `${splitPosition}%` }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              autoPlay
              muted={isMuted}
              playsInline
              loop
            />
            
            {/* Video controls overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-white text-sm font-medium bg-black/50 backdrop-blur-md px-2 py-1 rounded-md">
                  {title}
                </span>
              </div>
              <button className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Drag handle */}
          <motion.div
            className="absolute left-0 right-0 h-6 bg-zinc-900 flex items-center justify-center cursor-ns-resize z-40 -mt-3"
            style={{ top: `${splitPosition}%` }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            <div className="w-12 h-1 bg-zinc-600 rounded-full" />
            <ChevronUp className={`w-4 h-4 text-zinc-500 absolute right-4 transition-transform ${isDragging ? 'rotate-180' : ''}`} />
          </motion.div>

          {/* Bottom section - Website */}
          <motion.div 
            className="w-full overflow-hidden"
            style={{ height: `${100 - splitPosition}%` }}
            animate={{ height: `${100 - splitPosition}%` }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="absolute top-0 left-0 right-0 z-50 bg-zinc-900/90 backdrop-blur-md p-3 flex items-center justify-between">
  <span className="text-xs text-zinc-400">Embedded view restricted?</span>
  <button 
    onClick={() => window.open(websiteUrl, '_blank', 'noopener,noreferrer')}
    className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full transition-colors"
  >
    Open directly
  </button>
</div>
            
            <iframe 
  src={websiteUrl} 
  className="w-full h-full border-0 bg-white" 
  title="embedded-site"
  referrerPolicy="no-referrer"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>
            
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Demo data
const DEMO_CARDS = [
  {
    id: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=450&fit=crop",
    videoUrl: "https://cdv.naijaleakz.com/Many-Positions-During-Quickie.mp4",
    websiteUrl: "https://crn77.com/4/10563000",
    title: "Amazing Product Demo",
    description: "Check out our latest innovation in action. Click to explore the full experience.",
    domain: "crn77.com"
  },
  {
    id: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=450&fit=crop",
    videoUrl: "https://cdv.naijaleakz.com/Alicia-Kanini-porn-1.mp4",
    websiteUrl: "https://crn77.com/4/10563000",
    title: "Behind the Scenes",
    description: "See how we create magic. Watch the video and visit our site for more.",
    domain: "edwardspeedingchat.com"
  }
];

export default function App() {
  const [activeCard, setActiveCard] = useState<{
    videoUrl: string;
    websiteUrl: string;
    title: string;
  } | null>(null);

  const handleOpenSplitScreen = (videoUrl: string, websiteUrl: string, title: string) => {
    setActiveCard({ videoUrl, websiteUrl, title });
  };

  const handleClose = () => {
    setActiveCard(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Split-Screen Demo</h1>
          <div className="text-xs text-zinc-500">X/Twitter Video Website Card Pattern</div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="mb-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-300 mb-2">How it works</h2>
          <p className="text-sm text-zinc-500">
            This recreates the X/Twitter "Video Website Card" ad format. Tap a video below to see the split-screen experience: 
            video continues playing at top while the website loads below. Drag the handle to adjust the split.
          </p>
        </div>

        {DEMO_CARDS.map((card) => (
          <VideoCard
            key={card.id}
            thumbnailUrl={card.thumbnailUrl}
            videoUrl={card.videoUrl}
            websiteUrl={card.websiteUrl}
            title={card.title}
            description={card.description}
            domain={card.domain}
            onOpen={handleOpenSplitScreen}
          />
        ))}
      </main>

      {/* Split Screen Modal */}
      <SplitScreenModal
        isOpen={!!activeCard}
        onClose={handleClose}
        videoUrl={activeCard?.videoUrl || ""}
        websiteUrl={activeCard?.websiteUrl || ""}
        title={activeCard?.title || ""}
      />
    </div>
  );
}
