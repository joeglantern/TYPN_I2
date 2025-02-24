"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Share2, Volume2, VolumeX, Loader2, Link2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface BlogActionsProps {
  title: string
  description: string
  content: string
  metadata?: {
    author_name?: string
  }
}

export function BlogActions({ title, description, content, metadata }: BlogActionsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const synthesisRef = useRef<number | null>(null)
  const speakingSessionRef = useRef<{ active: boolean } | null>(null)

  // Helper function to split text into chunks
  const chunkText = (text: string, maxChunkLength: number): string[] => {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim() + '.';
      if ((currentChunk + ' ' + trimmedSentence).length > maxChunkLength) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  };

  const selectVoice = async (): Promise<SpeechSynthesisVoice | null> => {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      
      const findVoice = () => {
        voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

        // Try to find Google US English voice first (one of the best free voices)
        const googleVoice = voices.find(v => 
          v.name.includes('Google US English') || 
          v.name.includes('Google UK English')
        );
        if (googleVoice) {
          console.log('Selected Google voice:', googleVoice.name);
          return googleVoice;
        }

        // Next try other good quality voices
        const preferredVoice = voices.find(v => 
          (v.name.includes('Samantha') || 
           v.name.includes('Karen') ||
           v.name.includes('Daniel')) &&
          (v.lang === 'en-US' || v.lang === 'en-GB')
        );
        if (preferredVoice) {
          console.log('Selected preferred voice:', preferredVoice.name);
          return preferredVoice;
        }

        // Fallback to any English voice
        const fallbackVoice = voices.find(v => 
          v.lang.startsWith('en') && 
          !v.name.includes('Microsoft Server')
        );
        if (fallbackVoice) {
          console.log('Selected fallback voice:', fallbackVoice.name);
          return fallbackVoice;
        }

        return null;
      };

      // First try immediate selection
      let selectedVoice = findVoice();
      if (selectedVoice) {
        resolve(selectedVoice);
        return;
      }

      // Set up the voices changed event handler
      window.speechSynthesis.onvoiceschanged = () => {
        selectedVoice = findVoice();
        if (selectedVoice) {
          resolve(selectedVoice);
        }
      };

      // Fallback timeout with retries
      let attempts = 0;
      const maxAttempts = 10;
      const retryInterval = setInterval(() => {
        attempts++;
        selectedVoice = findVoice();
        
        if (selectedVoice || attempts >= maxAttempts) {
          clearInterval(retryInterval);
          resolve(selectedVoice);
        }
      }, 500);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "The blog post link has been copied to your clipboard"
      })
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "The blog post link has been copied to your clipboard"
    })
  }

  const speakText = async (text: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = await selectVoice();
        
        if (!voice) {
          throw new Error('No suitable voice found. Please check if text-to-speech is enabled in your browser settings.');
        }

        // Configure voice settings
        utterance.voice = voice;
        utterance.rate = 1.0;  // Normal speed
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 1.0;

        // Store the current utterance for cancellation
        utteranceRef.current = utterance;

        // Setup event handlers
        let hasStarted = false;
        let hasEnded = false;

        utterance.onstart = () => {
          hasStarted = true;
        };

        utterance.onend = () => {
          hasEnded = true;
          resolve();
        };

        utterance.onerror = (event) => {
          // Log the error but don't fail unless speech hasn't started
          console.log('Non-critical speech synthesis event:', event);
          
          // Only reject if speech hasn't started at all
          if (!hasStarted && !hasEnded) {
            reject(new Error('Failed to start speech'));
          } else if (!hasEnded) {
            // If speech was in progress, just resolve
            resolve();
          }
        };

        // Ensure speech synthesis is ready
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        // Verify that speech actually started
        setTimeout(() => {
          if (!hasStarted && !hasEnded) {
            reject(new Error('Speech failed to start after timeout'));
          }
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  };

  const startSpeaking = async () => {
    try {
      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis not supported in your browser');
      }

      // Stop any ongoing speech
      stopSpeaking();
      
      // Set loading state first
      setIsLoading(true);

      // Prepare text
      const authorName = metadata?.author_name || "an unnamed author";
      const introduction = "Hello! I am TYPNI AI, your intelligent reading companion. I will now read this article for you.";
      const articleIntro = `This article titled "${title}" was written by ${authorName}.`;
      
      const cleanContent = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const textToSpeak = `${introduction} ${articleIntro} Here's a brief description: ${description}. ${cleanContent}`;
      const chunks = chunkText(textToSpeak, 200);

      // Set speaking state before starting
      setIsLoading(false);
      setIsSpeaking(true);

      // Store current speaking session
      const speakingSession = { active: true };
      speakingSessionRef.current = speakingSession;

      // Chrome fix: keep synthesis active
      synthesisRef.current = window.setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 5000);

      // Speak chunks sequentially
      for (let i = 0; i < chunks.length; i++) {
        if (!speakingSessionRef.current?.active) break;

        try {
          await speakText(chunks[i]);
          // Small pause between chunks
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          // Only throw if it's a critical error
          if (error instanceof Error && 
              (error.message.includes('Failed to start') || 
               error.message.includes('No suitable voice'))) {
            throw error;
          } else {
            console.log('Non-critical error, continuing:', error);
          }
        }
      }

      // Clean up if we completed successfully
      if (speakingSessionRef.current?.active) {
        stopSpeaking();
        toast({
          title: "Complete",
          description: "Finished reading the article.",
        });
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      stopSpeaking();
      // Only show error toast for critical errors
      if (error instanceof Error && 
          (error.message.includes('Failed to start') || 
           error.message.includes('No suitable voice'))) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const stopSpeaking = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clear the keep-alive interval
    if (synthesisRef.current) {
      window.clearInterval(synthesisRef.current);
      synthesisRef.current = null;
    }
    
    // Cancel the current speaking session
    if (speakingSessionRef.current) {
      speakingSessionRef.current.active = false;
    }
    
    // Reset states
    setIsSpeaking(false);
    setIsLoading(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isSpeaking && (
          <motion.div
            key="ai-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 overflow-hidden bg-black/90"
          >
            {/* Neural Network Grid */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(78,205,196,0.1)_0%,transparent_70%)]" />
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`node-${i}`}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_30px_rgba(78,205,196,0.8)]" />
                </motion.div>
              ))}
            </div>

            {/* Energy Flow Lines */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`line-${i}`}
                  className="absolute h-[1px] w-full"
                  style={{
                    top: `${(i + 1) * 5}%`,
                    background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                    opacity: 0.3,
                  }}
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "linear"
                  }}
                />
              ))}
            </div>

            {/* Central AI Core */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 1.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                className="relative w-40 h-40"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 backdrop-blur-xl" />
                <Image
                  src="/logo.png"
                  alt="TYPNI Logo"
                  width={160}
                  height={160}
                  className="object-contain relative z-10 drop-shadow-[0_0_30px_rgba(78,205,196,0.8)]"
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      "0 0 30px 15px rgba(78,205,196,0.3)",
                      "0 0 60px 30px rgba(78,205,196,0.5)",
                      "0 0 30px 15px rgba(78,205,196,0.3)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </motion.div>

            {/* AI Status Badge */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", duration: 1, delay: 0.5 }}
              className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-primary/20 backdrop-blur-xl px-8 py-4 rounded-2xl border border-primary/30"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_rgba(78,205,196,0.8)]"
                />
                <span className="text-primary font-bold text-xl tracking-wider">TYPNI AI ACTIVE</span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-primary rounded-full border-t-transparent shadow-[0_0_10px_rgba(78,205,196,0.5)]"
                />
              </div>
            </motion.div>

            {/* Processing Waves */}
            <div className="absolute inset-x-0 bottom-0">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`wave-${i}`}
                  className="absolute bottom-0 left-0 w-[200%] h-40"
                  style={{
                    background: `linear-gradient(180deg, transparent, var(--primary))`,
                    opacity: 0.05 * (i + 1),
                    filter: 'blur(8px)',
                  }}
                  animate={{
                    x: ["-50%", "-150%"]
                  }}
                  transition={{
                    duration: 10 - i * 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>

            {/* Voice Visualization */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`bar-${i}`}
                  className="w-1 bg-primary"
                  animate={{
                    height: [10, 30, 10],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 relative z-[51]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="relative overflow-hidden bg-background/30 hover:bg-background/40 backdrop-blur-sm transition-all duration-300 text-white border-white/20 hover:border-white/40"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share via...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              <Link2 className="mr-2 h-4 w-4" />
              Copy link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          className={`relative overflow-hidden transition-all duration-300 ${
            isSpeaking 
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 border-primary/50"
              : "bg-background/30 hover:bg-background/40 backdrop-blur-sm text-white border-white/20 hover:border-white/40"
          }`}
          onClick={isSpeaking ? stopSpeaking : startSpeaking}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>TYPNI AI is preparing...</span>
            </>
          ) : isSpeaking ? (
            <>
              <VolumeX className="mr-2 h-4 w-4" />
              <span>Stop TYPNI AI</span>
            </>
          ) : (
            <>
              <motion.div 
                className="relative mr-2 w-4 h-4"
                initial={false}
              >
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-primary text-[8px] text-primary-foreground px-1 rounded-full font-semibold">
                    AI
                  </div>
                </div>
                <Volume2 className="h-4 w-4" />
              </motion.div>
              <span className="hidden xs:inline">Read with TYPNI AI</span>
              <span className="inline xs:hidden">Read</span>
            </>
          )}
        </Button>
      </div>
    </>
  )
} 