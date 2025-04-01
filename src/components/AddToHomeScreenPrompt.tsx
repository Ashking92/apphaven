
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const AddToHomeScreenPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Check if this is a PWA capable browser and if the user hasn't already dismissed or installed
    const hasPrompted = localStorage.getItem('pwaPromptDismissed');
    
    // Only show on mobile devices that are not already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        document.referrer.includes('android-app://');
    
    if (isMobile && !hasPrompted && !isStandalone) {
      // Delay the prompt for a better user experience
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile]);
  
  const handleDismiss = () => {
    localStorage.setItem('pwaPromptDismissed', 'true');
    setIsOpen(false);
  };
  
  if (!isMobile) return null;
  
  // Determine if iOS or Android for specific instructions
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add AppHaven to Home Screen</DialogTitle>
          <DialogDescription>
            Install our app for a better experience!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 p-2">
          {isIOS ? (
            <div className="space-y-2">
              <p>To install this app on your iPhone:</p>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Tap the share icon <span className="px-2 py-1 bg-gray-100 rounded">􀈂</span> at the bottom of your browser</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top right</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-2">
              <p>To install this app on your Android device:</p>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Tap the menu icon in your browser</li>
                <li>Tap "Install App" or "Add to Home Screen"</li>
                <li>Follow the on-screen instructions</li>
              </ol>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={handleDismiss}>
              Maybe Later
            </Button>
            <Button onClick={handleDismiss}>
              Got It
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToHomeScreenPrompt;
