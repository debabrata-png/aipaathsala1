import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, Box, Typography, Chip } from '@mui/material';
import { VolumeUp, Pause, Stop, VolumeOff } from '@mui/icons-material';

const TextToSpeech = ({ 
  text, 
  title = "Listen to AI Analysis", 
  variant = "button", // "button" | "icon" | "chip"
  size = "medium" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(0);

  // Check browser support and load voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Try to find English voice as default
      const englishVoiceIndex = availableVoices.findIndex(voice => 
        voice.lang.startsWith('en')
      );
      if (englishVoiceIndex !== -1) {
        setSelectedVoice(englishVoiceIndex);
      }
    };

    loadVoices();
    
    // Some browsers load voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Create utterance when text changes
  useEffect(() => {
    if (!text || !isSupported) return;

    const cleanText = cleanTextForSpeech(text);
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(cleanText);

    // Configure utterance
    utter.rate = 0.9; // Slightly slower for better comprehension
    utter.pitch = 1;
    utter.volume = 1;
    
    // Set voice if available
    if (voices.length > 0 && voices[selectedVoice]) {
      utter.voice = voices[selectedVoice];
    }

    // Event handlers
    utter.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utter.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utter.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utter.onpause = () => {
      setIsPaused(true);
    };

    utter.onresume = () => {
      setIsPaused(false);
    };

    setUtterance(utter);

    return () => {
      synth.cancel();
    };
  }, [text, isSupported, voices, selectedVoice]);

  // Clean text for better speech synthesis
  const cleanTextForSpeech = (text) => {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      // Replace bullet points with "point"
      .replace(/•/g, 'point')
      // Replace emojis with descriptive text
      .replace(/📚/g, 'Topic:')
      .replace(/🎥/g, 'Video:')
      .replace(/🔗/g, 'Link:')
      .replace(/📝/g, 'Summary:')
      .replace(/💬/g, 'Discussion:')
      .replace(/🎯/g, 'Learning Objectives:')
      .replace(/📊/g, 'Difficulty Level:')
      .replace(/⭐/g, 'Relevance Score:')
      .replace(/📋/g, 'Assignment:')
      .replace(/⏱️/g, 'Estimated Time:')
      .replace(/🎓/g, 'Learning Outcomes:')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handlePlay = () => {
    if (!utterance || !isSupported) return;

    const synth = window.speechSynthesis;

    if (isPlaying) {
      if (isPaused) {
        synth.resume();
      } else {
        synth.pause();
      }
    } else {
      synth.cancel(); // Clear any existing speech
      synth.speak(utterance);
    }
  };

  const handleStop = () => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return (
      <Tooltip title="Speech synthesis not supported in this browser">
        <span>
          <IconButton disabled size={size}>
            <VolumeOff />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  const getIcon = () => {
    if (isPlaying && !isPaused) return <Pause />;
    return <VolumeUp />;
  };

  const getTooltip = () => {
    if (isPlaying && !isPaused) return "Pause";
    if (isPlaying && isPaused) return "Resume";
    return "Listen to AI Analysis";
  };

  if (variant === "chip") {
    return (
      <Chip
        icon={getIcon()}
        label={isPlaying && !isPaused ? "Pause" : "Listen"}
        onClick={handlePlay}
        color="primary"
        variant="outlined"
        size={size}
        sx={{
          backgroundColor: isPlaying ? '#e3f2fd' : 'transparent',
          '&:hover': {
            backgroundColor: isPlaying ? '#bbdefb' : '#f5f5f5'
          }
        }}
      />
    );
  }

  if (variant === "icon") {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={getTooltip()}>
          <IconButton 
            onClick={handlePlay}
            size={size}
            sx={{
              color: isPlaying ? '#1976d2' : '#666',
              backgroundColor: isPlaying ? '#e3f2fd' : 'transparent',
              '&:hover': {
                backgroundColor: isPlaying ? '#bbdefb' : '#f5f5f5'
              }
            }}
          >
            {getIcon()}
          </IconButton>
        </Tooltip>
        
        {isPlaying && (
          <Tooltip title="Stop">
            <IconButton 
              onClick={handleStop}
              size="small"
              sx={{ color: '#d32f2f' }}
            >
              <Stop />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  // Default button variant
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={title}>
        <IconButton
          onClick={handlePlay}
          size={size}
          sx={{
            backgroundColor: isPlaying ? '#e3f2fd' : '#f8fafc',
            border: '1px solid #e0e7ff',
            color: isPlaying ? '#1976d2' : '#7c3aed',
            '&:hover': {
              backgroundColor: isPlaying ? '#bbdefb' : '#e0e7ff'
            }
          }}
        >
          {getIcon()}
        </IconButton>
      </Tooltip>
      
      {isPlaying && (
        <Typography variant="caption" color="primary" sx={{ fontSize: '0.75rem' }}>
          {isPaused ? 'Paused' : 'Playing...'}
        </Typography>
      )}
    </Box>
  );
};

export default TextToSpeech;
